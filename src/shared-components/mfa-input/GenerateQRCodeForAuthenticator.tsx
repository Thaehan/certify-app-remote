import React, { Component } from 'react';
import QRCode from 'react-native-qrcode-svg';

interface GoogleAuthenticatorQRCodeProps {
  issuer: string;
  secretKey: string;
  accountName: string;
}

class GenerateQRCodeForAuthenticator extends Component<GoogleAuthenticatorQRCodeProps> {
  render() {
    const { issuer, secretKey, accountName } = this.props;
    const otpAuthURL = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secretKey}&issuer=${encodeURIComponent(issuer)}`;

    return (
      <QRCode
        value={otpAuthURL}
        size={100}
        color="black"
        backgroundColor="white"
      />
    );
  }
}

export default GenerateQRCodeForAuthenticator;
