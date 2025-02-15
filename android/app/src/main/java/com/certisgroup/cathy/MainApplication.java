/*
 * Copyright (c) 2019 Certis CISCO Security Pte Ltd
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * Certis CISCO Security Pte Ltd. ("Confidential Information").
 * You shall not disclose such Confidential Information and shall use
 * it only in accordance with the terms of the license agreement you
 * entered into with Certis CISCO Security Pte Ltd.
 */
package com.certisgroup.cathy;

import android.app.Application;
import android.content.Context;
import android.content.res.Configuration;
import android.graphics.Typeface;
import android.os.Build;
import android.util.DisplayMetrics;
import android.view.WindowManager;

import androidx.core.content.res.ResourcesCompat;

import com.certisgroup.cathy.reactutils.CathyPackage;
import com.facebook.react.BuildConfig;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.views.text.ReactFontManager;
import com.facebook.soloader.SoLoader;
import com.google.android.gms.common.GooglePlayServicesNotAvailableException;
import com.google.android.gms.common.GooglePlayServicesRepairableException;
import com.google.android.gms.security.ProviderInstaller;
import com.google.android.things.update.UpdateManager;

import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import javax.net.ssl.SSLContext;

/**
 * Main Application to host react native instance and packages
 *
 * @author Lingqi
 */
public class MainApplication extends Application implements ReactApplication {

    private static final String TAG = "MAIN_APPLICATION";
    private ReactNativeHost reactNativeHost;
    private UpdateManager updateManager;

    //**************************************************************
    // Application Overrides
    //****************************************************************

    @Override
    public void onCreate() {
        super.onCreate();
        this.configFont();
        this.configSSL();
        this.addFont();
        SoLoader.init(this, false);
    }

    //**************************************************************
    // Implement ReactApplication
    //****************************************************************

    @Override
    public ReactNativeHost getReactNativeHost() {
        if (reactNativeHost == null) {
            reactNativeHost = new ReactHost(this);
        }
        return reactNativeHost;
    }

    private static class ReactHost extends ReactNativeHost {
        ReactHost(Application application) {
            super(application);
        }

        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            List<ReactPackage> packages = new PackageList(this).getPackages();
            packages.add(new CathyPackage());
            return packages;
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    }

    //**************************************************************
    // Other config
    //****************************************************************

    public UpdateManager appUpdateManager() {
        if (updateManager== null) {
            updateManager = UpdateManager.getInstance();
        }
        return updateManager;
    }

    private void configFont() {
        Configuration configuration = getResources().getConfiguration();
        if (configuration.fontScale != 1) {
            configuration.fontScale = 1;
            DisplayMetrics metrics = getResources().getDisplayMetrics();
            WindowManager manager = (WindowManager) getSystemService(Context.WINDOW_SERVICE);
            if (manager != null) {
                manager.getDefaultDisplay().getMetrics(metrics);
                metrics.scaledDensity = configuration.fontScale;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
                    createConfigurationContext(configuration);
                } else {
                    getResources().updateConfiguration(configuration, metrics);
                }
            }
        }
    }

    private void configSSL() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            try {
                ProviderInstaller.installIfNeeded(this);
                SSLContext sslContext = SSLContext.getInstance("TLSv1.2");
                sslContext.init(null, null, null);
                sslContext.createSSLEngine();
            } catch (GooglePlayServicesRepairableException | GooglePlayServicesNotAvailableException
                | NoSuchAlgorithmException | KeyManagementException e) {
                e.printStackTrace();
            }
        }
    }

    private void addFont() {
        Typeface robotoRegular = ResourcesCompat.getFont(this, R.font.roboto_regular);
        Typeface robotoMedium = ResourcesCompat.getFont(this, R.font.roboto_medium);
        Typeface robotoBold = ResourcesCompat.getFont(this, R.font.roboto_bold);
        ReactFontManager fontManager = ReactFontManager.getInstance();
        fontManager.setTypeface("Roboto-Regular", Typeface.NORMAL, robotoRegular);
        fontManager.setTypeface("Roboto-Medium", Typeface.NORMAL, robotoMedium);
        fontManager.setTypeface("Roboto-Bold", Typeface.NORMAL, robotoBold);
    }
}
