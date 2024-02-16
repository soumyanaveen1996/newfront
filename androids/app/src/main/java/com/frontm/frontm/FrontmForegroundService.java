package com.frontm.frontm;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class FrontmForegroundService extends Service {

    public static String STARTFOREGROUND_ACTION = "STARTFOREGROUND_ACTION";
    public static String STOPFOREGROUND_ACTION = "STOPFOREGROUND_ACTION";
    private String CHANNEL_ID = "FrontmForegroundService";

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d("FrontmForegroundService", "FrontmForeground service" + intent.getAction() + startId);
        if (intent.getAction().equals(STARTFOREGROUND_ACTION)) {
            int notificationId = intent.getIntExtra("notificationId", -1);
            createNotificationChannel();
            Intent notificationIntent = new Intent(this, IncomingCallScreenActivity.class);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    this,
                    0, notificationIntent, PendingIntent.FLAG_IMMUTABLE
            );
            String callerName = intent.getStringExtra("CALLER_NAME");
            String contentText = "Incoming call from " + callerName;
            if (null == callerName) {
                contentText = "Incoming Conference call";
            }
            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle("Incoming Call")
                    .setSmallIcon(R.drawable.ic_call_white)
                    .setContentIntent(pendingIntent)
                    .setContentText(contentText)
                    .build();
            startForeground(1, notification);
            return START_STICKY;
        } else if (intent.getAction() == STOPFOREGROUND_ACTION) {
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            manager.cancel(1);
            stopForeground(true);
            stopSelfResult(startId);
            // your start service code
        }
        return START_STICKY;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new  NotificationChannel(CHANNEL_ID, "Foreground Service Channel",
                    NotificationManager.IMPORTANCE_DEFAULT);
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            manager.createNotificationChannel(serviceChannel);
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}