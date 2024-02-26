export interface provider {
    name: string;
    available: boolean;
    confUrl: string;
    jwkUrl: string;
}

export const OIDCProviders: provider[] = [
    { name: "google", available: true, confUrl: "https://accounts.google.com/.well-known/openid-configuration", jwkUrl: "https://www.googleapis.com/oauth2/v3/certs" },
    { name: "kakao", available: true, confUrl: "https://kauth.kakao.com/.well-known/openid-configuration", jwkUrl: "https://kauth.kakao.com/.well-known/jwks.json" },
    { name: "twitch", available: true, confUrl: "https://id.twitch.tv/oauth2/.well-known/openid-configuration", jwkUrl: "https://id.twitch.tv/oauth2/keys" },
    { name: "line", available: false, confUrl: "https://access.line.me/.well-known/openid-configuration", jwkUrl: "https://api.line.me/oauth2/v2.1/certs" },
    { name: "apple", available: false, confUrl: "", jwkUrl: "https://appleid.apple.com/auth/keys" },
];
