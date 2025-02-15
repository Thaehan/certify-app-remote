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

import com.microsoft.appcenter.AppCenter;
import com.microsoft.appcenter.distribute.Distribute;

/**
 * App update manager handle App Center in-app-update
 *
 * @author Lingqi
 */
class UpdateManager {

    UpdateManager(Application application) {
        String secret = BuildConfig.APP_CENTER_SECRET;
        AppCenter.start(application, secret, Distribute.class);
    }

    void checkUpdate(Activity activity, int requestCode) {
        Distribute.checkForUpdate();
    }
}
