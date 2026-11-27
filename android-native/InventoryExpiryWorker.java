package com.redro.spoilfreecopy;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.HashSet;
import java.util.Set;

public class InventoryExpiryWorker extends Worker {
    private static final String PREFS = "redro_background_inventory";
    private static final String CHANNEL_ID = "redro-expiry-notifications-v3";

    public InventoryExpiryWorker(Context context, WorkerParameters params) {
        super(context, params);
    }

    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        if (Build.VERSION.SDK_INT >= 33 &&
            context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            return Result.success();
        }

        try {
            android.content.SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String raw = prefs.getString("items", "[]");
            String language = prefs.getString("language", "ar");
            JSONArray items = new JSONArray(raw);
            NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager == null || !manager.areNotificationsEnabled()) return Result.success();
            ensureChannel(context, manager);
            if (Build.VERSION.SDK_INT >= 26) {
                NotificationChannel activeChannel = manager.getNotificationChannel(CHANNEL_ID);
                if (activeChannel == null || activeChannel.getImportance() == NotificationManager.IMPORTANCE_NONE) return Result.success();
            }
            Set<String> sent = new HashSet<>(prefs.getStringSet("sent", new HashSet<>()));
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
            dateFormat.setLenient(false);
            dateFormat.setTimeZone(TimeZone.getDefault());
            Calendar todayCalendar = Calendar.getInstance();
            int todayOrdinal = utcDayOrdinal(todayCalendar.get(Calendar.YEAR), todayCalendar.get(Calendar.MONTH), todayCalendar.get(Calendar.DAY_OF_MONTH));
            boolean changed = false;

            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.optJSONObject(i);
                if (item == null || !item.optBoolean("hasExpiry", true)) continue;
                if (item.optDouble("quantity", 0) <= 0) continue;
                String expiry = item.optString("expiryDate", "");
                String itemId = item.optString("id", "");
                String name = item.optString("name", "");
                if (expiry.isEmpty() || itemId.isEmpty() || name.isEmpty()) continue;

                Date expiryDate;
                try { expiryDate = dateFormat.parse(expiry); }
                catch (Exception ignored) { continue; }
                if (expiryDate == null) continue;
                Calendar expiryCalendar = Calendar.getInstance();
                expiryCalendar.setTime(expiryDate);
                int expiryOrdinal = utcDayOrdinal(
                    expiryCalendar.get(Calendar.YEAR),
                    expiryCalendar.get(Calendar.MONTH),
                    expiryCalendar.get(Calendar.DAY_OF_MONTH)
                );
                long days = (long) expiryOrdinal - todayOrdinal;
                String kind = days == 3 ? "three" : days == 2 ? "two" : days <= 0 ? "expired" : "";
                if (kind.isEmpty()) continue;

                String key = itemId + "|" + expiry + "|" + kind;
                if (sent.contains(key)) continue;

                String title;
                String body;
                if ("three".equals(kind)) {
                    title = "ar".equals(language) ? "تذكير بانتهاء الصلاحية" : "Expiry reminder";
                    body = "ar".equals(language) ? "بقي 3 أيام على انتهاء صلاحية " + name + "." : name + " expires in 3 days.";
                } else if ("two".equals(kind)) {
                    title = "ar".equals(language) ? "تذكير بانتهاء الصلاحية" : "Expiry reminder";
                    body = "ar".equals(language) ? "بقي يومان على انتهاء صلاحية " + name + "." : name + " expires in 2 days.";
                } else {
                    title = "ar".equals(language) ? "تحذير: منتج منتهي الصلاحية" : "Expired item warning";
                    body = "ar".equals(language) ? "انتهت صلاحية " + name + "." : name + " has expired.";
                }

                Intent launch = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
                PendingIntent contentIntent = null;
                if (launch != null) {
                    launch.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    contentIntent = PendingIntent.getActivity(context, itemId.hashCode(), launch,
                        PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
                }

                Notification.Builder builder = Build.VERSION.SDK_INT >= 26
                    ? new Notification.Builder(context, CHANNEL_ID)
                    : new Notification.Builder(context);
                builder.setSmallIcon(android.R.drawable.ic_dialog_info)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setStyle(new Notification.BigTextStyle().bigText(body))
                    .setAutoCancel(true)
                    .setCategory(Notification.CATEGORY_REMINDER);
                if (contentIntent != null) builder.setContentIntent(contentIntent);
                if (Build.VERSION.SDK_INT < 26) builder.setDefaults(Notification.DEFAULT_ALL).setPriority(Notification.PRIORITY_HIGH);

                int notificationId = key.hashCode() & 0x7fffffff;
                manager.notify(notificationId, builder.build());
                sent.add(key);
                changed = true;
            }

            if (changed) prefs.edit().putStringSet("sent", sent).apply();
            return Result.success();
        } catch (Exception error) {
            android.util.Log.e("RedroExpiryWorker", "Background expiry check failed", error);
            return Result.retry();
        }
    }

    private static int utcDayOrdinal(int year, int month, int day) {
        Calendar calendar = new GregorianCalendar(TimeZone.getTimeZone("UTC"), Locale.US);
        calendar.clear();
        calendar.set(year, month, day, 0, 0, 0);
        return (int) (calendar.getTimeInMillis() / 86400000L);
    }

    private static void ensureChannel(Context context, NotificationManager manager) {
        if (Build.VERSION.SDK_INT < 26 || manager.getNotificationChannel(CHANNEL_ID) != null) return;
        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Redro notifications", NotificationManager.IMPORTANCE_HIGH);
        channel.setDescription("Expiry and inventory notifications");
        channel.enableVibration(true);
        channel.setSound(android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION),
            new android.media.AudioAttributes.Builder()
                .setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build());
        manager.createNotificationChannel(channel);
    }
}
