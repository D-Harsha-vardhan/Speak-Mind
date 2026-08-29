package com.speakmind

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var myWebView: WebView
    
    // Set this URL to your hosted Next.js production address (e.g. Vercel deployment URL),
    // or point it to your local machine IP address when testing locally with a phone!
    private val appUrl = "http://10.53.105.17:3000" // Use Local IP for wireless testing

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Programmatically create the WebView to fill the screen
        myWebView = WebView(this)
        setContentView(myWebView)

        myWebView.settings.apply {
            // Enable JavaScript (essential for Next.js app)
            javaScriptEnabled = true
            
            // Enable DOM Storage (essential for state persistence / localStorage)
            domStorageEnabled = true
            
            // Enable Caching & Web Database support
            cacheMode = WebSettings.LOAD_DEFAULT
            databaseEnabled = true
            
            // Configure Viewport scales for mobile screens
            useWideViewPort = true
            loadWithOverviewMode = true
        }
        
        // Keep session cookies active across app runs
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(myWebView, true)

        // Ensure links clicked inside the app stay inside the app
        myWebView.webViewClient = object : WebViewClient() {
            @Deprecated("Deprecated in Java")
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                view.loadUrl(url)
                return true
            }
        }

        // Load the SpeakMind homepage
        myWebView.loadUrl(appUrl)
    }

    // Handle back presses in Android natively to navigate web history
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (myWebView.canGoBack()) {
            myWebView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
