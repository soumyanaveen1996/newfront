package com.frontm.frontm.proto;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import java.io.InputStream;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;

public class TLSContext {

    private static TLSContext sharedContext;
    private SSLContext mTlsContext;

    private TLSContext(ReactApplicationContext context) throws java.io.IOException,
            java.security.KeyStoreException, java.security.cert.CertificateException, java.security.NoSuchAlgorithmException,
            java.security.KeyManagementException {
        KeyStore trust_store = KeyStore.getInstance(KeyStore.getDefaultType());
        trust_store.load(null);

        InputStream input_stream = context.getAssets().open("sectigoSHA2.ca-bundle");

        CertificateFactory cert_factory = CertificateFactory.getInstance("X.509");
        Certificate cert = cert_factory.generateCertificate(input_stream);
        trust_store.setCertificateEntry("cert", cert);

        TrustManagerFactory trust_manager_factory = TrustManagerFactory.getInstance(
                TrustManagerFactory.getDefaultAlgorithm());
        trust_manager_factory.init(trust_store);
        TrustManager[] trust_manager = trust_manager_factory.getTrustManagers();

        mTlsContext = SSLContext.getInstance("TLSv1.2");
        mTlsContext.init(null, trust_manager, null);
    }

    public static TLSContext shared(ReactApplicationContext context) throws java.io.IOException,
            java.security.KeyStoreException, java.security.cert.CertificateException, java.security.NoSuchAlgorithmException,
            java.security.KeyManagementException {
        if (sharedContext == null) {
            sharedContext = new TLSContext(context);
        }
        return sharedContext;
    }

    public SSLSocketFactory getSocketFactory() {
        return mTlsContext.getSocketFactory();
    }

}

