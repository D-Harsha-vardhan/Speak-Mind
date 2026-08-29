package com.speakmind;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private WebView myWebView;
    // Set this URL to your hosted Next.js production address (e.g. Vercel deployment URL),
    // or point it to your local machine IP address when testing locally with a phone!
    private static final String APP_URL = "http://10.53.105.17:3000"; // Use Local IP for wireless testing

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Programmatically create the WebView to fill the screen
        myWebView = new WebView(this);
        setContentView(myWebView);

        WebSettings webSettings = myWebView.getSettings();
        
        // Enable JavaScript (essential for Next.js app)
        webSettings.setJavaScriptEnabled(true);
        
        // Enable DOM Storage (essential for state persistence / localStorage)
        webSettings.setDomStorageEnabled(true);
        
        // Enable Caching & Web Database support
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setDatabaseEnabled(true);
        
        // Configure Viewport scales for mobile screens
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);
        
        // Keep session cookies active across app runs
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(myWebView, true);

        // Ensure links clicked inside the app stay inside the app
        myWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        // Load the SpeakMind homepage
        myWebView.loadUrl(APP_URL);
    }

    // Handle back presses in Android natively to navigate web history
    @Override
    public void onBackPressed() {
        if (myWebView.canGoBack()) {
            myWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
