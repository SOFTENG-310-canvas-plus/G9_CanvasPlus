import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@supabase/supabase-js");
vi.mock("react-hot-toast", () => {
    return {
        toast: {
            success: vi.fn(),
            error: vi.fn(),
        },
        Toaster: () => null,
    };
});

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (orig) => {
    const actual = await orig.importActual("react-router-dom");
    return { ...actual, useNavigate: () => navigateMock };
});


import { toast } from "react-hot-toast";
import UserLogin from "../../auth/UserLogin.jsx";
import {__setAuthUser, __setErrors} from "./supabase-js.js";

describe("UserLogin", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        __setAuthUser(null);
        __setErrors({});
    });

    function typeCreds(email = "a@b.com", password = "secret") {
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
    }

    it("renders form", () => {
        render(<UserLogin />);
        expect(screen.getByText(/login/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /click to sign up/i })).toBeInTheDocument();
    });

    it("successful sign-in → toast + navigate('/canvas-plus')", async () => {
        render(<UserLogin />);
        typeCreds();
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith("Login successful");
            expect(navigateMock).toHaveBeenCalledWith("/canvas-plus");
        });
    });

    it("failed sign-in → error toast + clears fields", async () => {
        __setErrors({ signIn: { message: "Invalid login" } });

        render(<UserLogin />);
        typeCreds("wrong@user.com", "nope");
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Invalid login"));

        expect(screen.getByLabelText(/email/i).value).toBe("");
        expect(screen.getByLabelText(/password/i).value).toBe("");
    });

    it("Click to Sign Up navigates to /sign-up", () => {
        render(<UserLogin />);
        fireEvent.click(screen.getByRole("button", { name: /click to sign up/i }));
        expect(navigateMock).toHaveBeenCalledWith("/sign-up");
    });
});
