'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Icons } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';


const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { user, login, signup, loading, error } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    if (!isMounted) return; // Prevent submission until component is mounted
    try {
        if (isLoginView) {
            await login(data.email, data.password);
        } else {
            await signup(data.email, data.password);
        }
        // The useEffect above will handle redirection
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: err.message || 'An error occurred. Please try again.',
      });
    }
  }

  if (!isMounted) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Icons.logo className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
            <div className="flex gap-2 items-center">
                <Icons.logo className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold font-headline text-foreground">Mehregan Planner</h1>
            </div>
            <div className="flex flex-1 items-center justify-end space-x-2">
                <ThemeToggle />
            </div>
            </div>
        </header>
        <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-sm">
            <CardHeader>
            <CardTitle className="text-2xl">{isLoginView ? 'Login' : 'Sign Up'}</CardTitle>
            <CardDescription>
                {isLoginView ? "Enter your credentials to access your tasks." : "Create an account to start planning."}
            </CardDescription>
            </CardHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="grid gap-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                        <Input type="email" placeholder="m@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoginView ? 'Login' : 'Sign Up'}
                </Button>
                <Button
                    type="button"
                    variant="link"
                    className="w-full"
                    onClick={() => setIsLoginView(!isLoginView)}
                    disabled={loading}
                >
                    {isLoginView ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                </Button>
                </CardFooter>
            </form>
            </Form>
        </Card>
        </main>
    </div>
  );
}
