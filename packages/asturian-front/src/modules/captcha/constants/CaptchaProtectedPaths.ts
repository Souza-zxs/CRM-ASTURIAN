import { AppPath } from 'zyra-shared/types';

export const CAPTCHA_PROTECTED_PATHS: string[] = [
  AppPath.SignInUp,
  AppPath.Login,
  AppPath.SignUp,
  AppPath.Verify,
  AppPath.VerifyEmail,
  AppPath.ResetPassword,
  AppPath.Invite,
];
