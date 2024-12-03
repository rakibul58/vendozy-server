interface EmailTemplateProps {
  resetPassLink: string;
  companyName?: string;
}

// will generate a html for reset password email with reset password link
export const generatePasswordResetEmailTemplate = ({
  resetPassLink, 
  companyName = 'Your Company'
}: EmailTemplateProps) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .email-header {
            background-color: #3498db;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .email-body {
            padding: 30px;
        }
        .reset-button {
            display: inline-block;
            background-color: #2ecc71;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
        }
        .footer {
            background-color: #ecf0f1;
            color: #7f8c8d;
            text-align: center;
            padding: 10px;
            font-size: 12px;
        }
        .note {
            color: #7f8c8d;
            font-size: 14px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Password Reset</h1>
        </div>
        <div class="email-body">
            <p>Dear User,</p>
            <p>We received a request to reset the password for your account. Click the button below to reset your password:</p>
            
            <a href="${resetPassLink}" class="reset-button">Reset Password</a>
            
            <p class="note">
                If you did not request a password reset, please ignore this email or contact support if you have any concerns.
            </p>
            
            <p>This link will expire in 5 minutes.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${companyName}. All rights reserved.
        </div>
    </div>
</body>
</html>
`;