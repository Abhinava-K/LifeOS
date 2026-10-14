export type RootTabParamList = {
  Home: undefined;
  AI: undefined;
  Search: undefined;
  Planner: undefined;
  Library: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  OtpVerify: {
    email: string;
    fullName?: string;
    isGoogle?: boolean;
    debugOtp?: string;
  };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
