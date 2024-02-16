package com.frontm.frontm; // ← Make sure that is your package name

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent intent = new Intent(this, MainActivity.class);
        if(getIntent().getExtras() != null){
            Log.d("RNPushNotification", "copyying extras");
            intent.putExtras(getIntent().getExtras());
        }
        startActivity(intent);
        finish();
    }
}
