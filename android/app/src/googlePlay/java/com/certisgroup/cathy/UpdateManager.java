/*
 * Copyright (c) 2020 Certis CISCO Security Pte Ltd
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * Certis CISCO Security Pte Ltd. ("Confidential Information").
 * You shall not disclose such Confidential Information and shall use
 * it only in accordance with the terms of the license agreement you
 * entered into with Certis CISCO Security Pte Ltd.
 */
package com.certisgroup.cathy;

import android.app.Activity;
import android.app.Application;
import android.content.IntentSender.SendIntentException;

import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.UpdateAvailability;

/**
 * App update manager handle Google Play in-app-update
 *
 * @author Lingqi
 */
class UpdateManager {

    private AppUpdateManager updateManager;

    UpdateManager(Application application) {
        updateManager = AppUpdateManagerFactory.create(application);
    }

    void checkUpdate(Activity activity, int requestCode) {
        updateManager.getAppUpdateInfo().addOnSuccessListener((updateInfo) -> {
            if (updateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE ||
                updateInfo.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
                try {
                    updateManager.startUpdateFlowForResult(updateInfo, AppUpdateType.IMMEDIATE,
                        activity, requestCode);
                } catch (SendIntentException e) {
                    e.printStackTrace();
                }
            }
        });
    }
}
