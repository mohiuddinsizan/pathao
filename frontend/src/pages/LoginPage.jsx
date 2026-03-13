/**
 * Login Page — polished email + password form matching reference UI.
 * Grid background, centered Card, PalettePicker in footer.
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PalettePicker from "@/components/PalettePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const errorRef = useRef(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsPending(true);

    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.error || "Login failed. Please check your credentials.");
    }
    setIsPending(false);
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-4">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-size-[4rem_4rem] bg-center mask-[radial-gradient(ellipse_at_center,black_20%,transparent_70%)] pointer-events-none" />

      <Card className="relative w-full max-w-sm shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Pathao Parcel
          </CardTitle>
          <CardDescription>
            Merchant Order Management System
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Error */}
          {error && (
            <div
              ref={errorRef}
              role="alert"
              aria-live="assertive"
              tabIndex={-1}
              className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-foreground outline-none"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@pathao.com"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full"
            >
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <PalettePicker />
        </CardFooter>
      </Card>
    </div>
  );
}
