package com.redro.spoilfreecopy;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.ExistingWorkPolicy;
import androidx.work.OneTimeWorkRequest;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import org.json.JSONArray;

import java.util.concurrent.TimeUnit;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NotificationSettings")
public class NotificationSettingsPlugin extends Plugin {
    private static final String ALARM_CHANNEL_ID = "redro-expiry-notifications-v3";

    @PluginMethod
    public void ensureAlarmChannel(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationManager manager = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
                NotificationChannel existing = manager.getNotificationChannel(ALARM_CHANNEL_ID);
                if (existing == null) {
                    NotificationChannel channel = new NotificationChannel(
                        ALARM_CHANNEL_ID,
                        "Redro notifications",
                        NotificationManager.IMPORTANCE_HIGH
                    );
                    channel.setDescription("Expiry and inventory notifications");
                    channel.enableVibration(true);
                    channel.setVibrationPattern(new long[]{0, 700, 250, 700, 250, 1000});
                    channel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
                    Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
                    if (alarmSound == null) alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
                    AudioAttributes attributes = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build();
                    channel.setSound(alarmSound, attributes);
                    manager.createNotificationChannel(channel);
                }
            }
            JSObject result = new JSObject();
            result.put("channelId", ALARM_CHANNEL_ID);
            result.put("importance", "high");
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Unable to create the Redro alarm notification channel", error);
        }
    }

    @PluginMethod
    public void syncInventoryBackground(PluginCall call) {
        try {
            JSONArray items = call.getArray("items");
            if (items == null) items = new JSONArray();
            String language = call.getString("language");
            if (language == null || language.isEmpty()) language = "ar";
            getContext().getSharedPreferences("redro_background_inventory", Context.MODE_PRIVATE)
                .edit()
                .putString("items", items.toString())
                .putString("language", language)
                .apply();

            WorkManager workManager = WorkManager.getInstance(getContext());
            PeriodicWorkRequest periodic = new PeriodicWorkRequest.Builder(
                InventoryExpiryWorker.class, 15, TimeUnit.MINUTES
            ).build();
            workManager.enqueueUniquePeriodicWork(
                "redro-background-expiry-check",
                ExistingPeriodicWorkPolicy.KEEP,
                periodic
            );

            OneTimeWorkRequest immediate = new OneTimeWorkRequest.Builder(InventoryExpiryWorker.class).build();
            workManager.enqueueUniqueWork(
                "redro-background-expiry-check-now",
                ExistingWorkPolicy.REPLACE,
                immediate
            );

            JSObject result = new JSObject();
            result.put("scheduled", true);
            result.put("intervalMinutes", 15);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Unable to schedule Redro background inventory checks", error);
        }
    }

    @PluginMethod
    public void open(PluginCall call) {
        try {
            Intent intent;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                intent.putExtra(Settings.EXTRA_APP_PACKAGE, getContext().getPackageName());
            } else {
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(intent);
            JSObject result = new JSObject();
            result.put("opened", true);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Unable to open notification settings", error);
        }
    }
}
