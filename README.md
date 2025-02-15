# Cathay

* Cathay is an authentication app for Certis CISCO

## Protocol
* Deep Link structure for Auth
> certis-cathy://cathy?action=auth&scheme={your-app-scheme}&module={your-module}&state={your-state}
 
* Success Callback for Auth
> {your-app-scheme}://{your-module}/cathy?action=auth&success=true&token={JSON}&state={your-state}
 
* Failure Callback for Auth
> {your-app-scheme}://{your-module}/cathy?action=auth&success=false&error={errorMessage}&state={your-state}

Note: 

1 The three mandatory parameters returned in the query string are "action", "success" and "state".

2 The JSON structure of the token is shown at the bottom of this page

3 The state is a unique String for each request. You can use UUID, timestamp, random number and so on.

## How to invoke in Android app
* In AndroidManifest.xml, For the Activity in which you want to call Cathy, set the 'launchMode' to "singleTop", add a 'intent-filter' to your Activity.

```xml
    ......
    <activity
        ......
        android:launchMode="singleTop">
        <intent-filter>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <data
                android:scheme="your-app-scheme"
                android:host="your-module" />
        </intent-filter>
    </activity>
    ......
```
* In the Activity in which you want to call Cathy, handle the callback Intent properly

```java
    ......
    private String currentState = "";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        ......
        handleIntent();
    }
    
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent();
    }
    
    /**
     * Request auth from Cathy app
     */
    public void onClickAuth(View view) {
        currentState = UUID.randomUUID().toString();
        Uri uri = Uri.parse("certis-cathy://cathy")
            .buildUpon()
            .appendQueryParameter("action", "auth")
            .appendQueryParameter("scheme", your-app-scheme)
            .appendQueryParameter("module", your-module)
            .appendQueryParameter("state", currentState)
            .build();
        Intent cathyAuth = new Intent(Intent.ACTION_VIEW, uri);
        PackageManager packageManager = getPackageManager();
        List<ResolveInfo> activities = packageManager.queryIntentActivities(
            cathyAuth,
            PackageManager.MATCH_DEFAULT_ONLY
        );
        if (activities.size() > 0) {
            startActivity(cathyAuth);
        } else {
            // Alert the user to install Cathy
        }
    }
    
    /**
     * Handle callback from Cathy app
     */
    private void handleIntent() {
        Uri uri = getIntent().getData();
        if (uri == null) {
            return;
        }
        String path = uri.getPath();
        if (path != null && path.equals("/cathy")) {
            String action = uri.getQueryParameter("action");
            if (action != null && action.equals("auth")) {
                String state = uri.getQueryParameter("state");
                if (!currentState.equals(state)) {
                    return;
                }
                boolean success = Boolean.parseBoolean(uri.getQueryParameter("success"));
                if (success) {
                    handleCathyAuthSuccess(uri);
                } else {
                    handleCathyAuthFailure(uri);
                }
            }
        }
    }

    private void handleCathyAuthSuccess(Uri uri) {
        String token = uri.getQueryParameter("token");
        // handle token
        ...
    }

    private void handleCathyAuthFailure(Uri uri) {
        String error = uri.getQueryParameter("error");
        // handle error message
        ...
    }
```

## How to invoke in iOS app
* In info.plist, config your Bundle URL Type and add cathy's scheme to LSApplicationQueriesSchemes.

```xml
    <dict>
        ......
        <key>CFBundleURLTypes</key>
        <array>
            <dict>
                <key>CFBundleTypeRole</key>
                <string>Editor</string>
                <key>CFBundleURLSchemes</key>
                <array>
                    <string>your-app-scheme</string>
                </array>
            </dict>
        </array>
        <key>LSApplicationQueriesSchemes</key>
        <array>
            <string>certis-cathy</string>
        </array>
    </dict>
```
* In AppDelegate, handle and redirect URL properly.

```swift
    ......
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        let host = url.host
        let path = url.path
        if host == your-module && path == "/cathy" {
            if let queryItems = URLComponents(url: url, resolvingAgainstBaseURL: true)?.queryItems {
                let action = queryItems.first(where: {$0.name == "action"})?.value
                if action == "auth" {
                    // get your view controller instance
                    viewController.handleCathyAuth(queryItems: queryItems)
                }
            }
        }
        return true
    }
```
* In the View Controller in which you want to call Cathy, handle callback properly

```swift
    ......
    private var currentState = ""
    
    /**
     * Request auth from Cathy app
     */
    @IBAction func onClickButton(_ sender: UIButton) {
        currentState = UUID().uuidString
        var components = URLComponents(string: "certis-cathy://cathy")!
        var queryItems = [URLQueryItem]()
        queryItems.append(URLQueryItem(name: "action", value: "auth"))
        queryItems.append(URLQueryItem(name: "scheme", value: your-app-scheme))
        queryItems.append(URLQueryItem(name: "module", value: your-module))
        queryItems.append(URLQueryItem(name: "state", value: currentState))
        components.queryItems = queryItems
        let url = components.url!
        if UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        } else {
            // Alert the user to install Cathy
        }
    }
    
    /**
     * Handle callback from Cathy app
     */
    func handleCathyAuth(queryItems: [URLQueryItem]) {
        let state = queryItems.first(where: {$0.name == "state"})?.value
        if currentState != state {
            return
        }
        let success = queryItems.first(where: {$0.name == "success"})?.value == "true"
        if success {
            handleCathyAuthSuccess(queryItems: queryItems)
        } else {
            handleCathyAuthFailure(queryItems: queryItems)
        }
    }
    
    private func handleCathyAuthSuccess(queryItems: [URLQueryItem]) {
        let jsonString = queryItems.first(where: {$0.name == "token"})?.value
        // handle token
        ...
    }
    
    private func handleCathyAuthFailure(queryItems: [URLQueryItem]) {
        let error = queryItems.first(where: {$0.name == "error"})?.value
        // handle error message
        ...
    }
```

## DEVELOPMENT

    npm start

For Android, go to Android Studio and run the "debug" build variant.

## DEPLOYMENT

### Setup

In `cathy-app` directory:

    npm install

Check versions of `npm` and `node`:

    node -v
    npm -v

node should be 8.16 and npm should be 6.4.

### Building for iOS

Check Cocoapods is installed.

    sudo gem install cocoapods

Go to Xcode, check Command Line Tools in Preferences (Locations), make sure it is the same as Xcode.

Go to `ios` directory:

    pod install

Open `Cathy.xcworkspace`, not `Cathy.xcodeproject`!

Open Preferences, Accounts. Add your corporate Apple developer account.

Start build:

- Select Profile "Certify-staging" ("Certify-release" for release)
- Select "Generic iOS Device"
- Click "Product"
- Click "Archive"

Once the build has completed and the Archive dialog appears:

- Select "Distribute App"
- Select "Enterprise"
- Check "Rebuild from Bitcode"
- Uncheck "Strip Swift Symbols"
- Check "Include manifest for over-the-air installation"
- Enter the following:
  - Name: Certify
  - App URL: [URL of IPA]
  - Display Image URL: [URL of AppIcon-57.png]
  - Full Size Image URL [URL of AppIcon-512.png]
- Select "Automatically manage signing"
  - Xcode will look for the certificate to be used for signing.
    If the certificate is not found, it will show a dialog showing the users to request the certificates from.
  - Request the certificate file and import the certficate into Keychain.
- Click "Export" after compilation completes

URLs:
- https://certify.to/downloads/Certify-release-latest.ipa
- https://certify.to/downloads/AppIcon-57.png
- https://certify.to/downloads/AppIcon-512.png

### Building for Android

Ensure that you have Android Studio 3.4 or later.

After opening the project with Android Studio, the project may not be "synced". Select "File" and "Sync Project with Gradle Files".

Start build:

- Click "Build"
- Click "Generate Signed Bundle / APK"
  - Staging: Select "APK"
  - Release: Select "Android App Bundle"
- Specify keystore path (`GTO-TPD.jkd`)
- Specify keystore password, "Cathy" as key alias and key password
- Uncheck "Export encrypted key for enrolling published apps"
- Select build variant
