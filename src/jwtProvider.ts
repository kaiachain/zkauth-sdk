import { RsaJsonWebKey, JwtWithNonce } from ".";

export interface IJwtProvider {
    /**
     * confUrl is the URL of the OpenID Connect discovery document.
     */
    readonly confUrl: string;

    /**
     * jwksUrl is the URL of the JSON Web Key Set (JWKS) document.
     */
    readonly jwksUrl: string;

    /**
     * aud is the audience of the JWT.
     */
    readonly aud: string;

    /**
     * iss is the issuer of the JWT.
     */
    readonly iss: string;

    /**
     * jwk is the JSON Web Key (JWK) of the JWT.
     * needed for authBuilder to generate public signals.
     */
    readonly jwk: RsaJsonWebKey;
    readonly jwtWithNonce: JwtWithNonce;
}

export class JwtProvider implements IJwtProvider {
    readonly confUrl: string;
    readonly jwksUrl: string;
    readonly jwk: RsaJsonWebKey;

    readonly jwt: JwtWithNonce;

    constructor(confUrl: string, jwksUrl: string, jwt: JwtWithNonce, jwk: RsaJsonWebKey) {
        this.confUrl = confUrl;
        this.jwksUrl = jwksUrl;

        this.jwt = structuredClone(jwt);

        this.jwk = jwk;
    }

    get aud() {
        return this.jwt.payload.aud as string;
    }

    get iss() {
        return this.jwt.payload.iss as string;
    }

    get jwtWithNonce() {
        return this.jwt;
    }
}
