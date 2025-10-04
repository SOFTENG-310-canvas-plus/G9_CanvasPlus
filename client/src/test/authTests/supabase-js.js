import { vi } from "vitest";

let _state = {
    user: null,
    session: null,
    signInError: null,
    signUpError: null,
    signOutError: null,
    onAuthChangeHandler: null,
};

export function __setAuthUser(user) {
    _state.user = user;
    _state.session = user ? { user } : null;
}

export function __triggerAuthEvent(event) {
    if (_state.onAuthChangeHandler) {
        const sess = event === "SIGNED_OUT" ? null : _state.session;
        _state.onAuthChangeHandler(event, sess);
    }
}

export function __setErrors({ signIn, signUp, signOut } = {}) {
    _state.signInError = signIn ?? null;
    _state.signUpError = signUp ?? null;
    _state.signOutError = signOut ?? null;
}

export const createClient = vi.fn((_url, _key) => {
    return {
        auth: {
            async signInWithPassword({ email }) {
                if (_state.signInError) return { data: { user: null }, error: _state.signInError };
                const fakeUser = _state.user ?? { id: "user_123", email };
                __setAuthUser(fakeUser);
                return { data: { user: fakeUser, session: { user: fakeUser } }, error: null };
            },
            async signUp({ email }) {
                if (_state.signUpError) return { data: { user: null }, error: _state.signUpError };
                const fakeUser = { id: "user_new", email };
                __setAuthUser(fakeUser);
                return { data: { user: fakeUser }, error: null };
            },
            async signOut() {
                if (_state.signOutError) return { error: _state.signOutError };
                __setAuthUser(null);
                return { error: null };
            },
            async getUser() {
                return { data: { user: _state.user }, error: null };
            },
            onAuthStateChange(cb) {
                _state.onAuthChangeHandler = cb;
                return {
                    data: {
                        subscription: {
                            unsubscribe: () => {
                                _state.onAuthChangeHandler = null;
                            },
                        },
                    },
                    error: null,
                };
            },
        },
    };
});
