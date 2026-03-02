import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Decode JWT payload without verification (safe for client-side user info extraction)
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error

  useEffect(() => {
    const handleAuthCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        let errorMessage = 'Authentication failed';
        
        switch (error) {
          case 'no_code':
            errorMessage = 'No authorization code received from Google';
            break;
          case 'auth_failed':
            errorMessage = 'Google authentication failed';
            break;
          default:
            errorMessage = 'An unknown error occurred during authentication';
        }

        toast({
          title: 'Authentication Failed',
          description: errorMessage,
          variant: 'destructive',
        });

        setTimeout(() => { navigate('/login'); }, 3000);
        return;
      }

      if (token) {
        try {
          // Decode payload to extract user info (no API call needed)
          const payload = decodeJwtPayload(token);

          if (!payload || !payload.userId) {
            throw new Error('Invalid token payload');
          }

          const userData = {
            id: payload.userId,
            email: payload.email,
            username: payload.username,
            name: payload.name,
            role: payload.role,
          };

          // Store in AuthContext and localStorage using correct keys
          login(userData, token, null);

          setStatus('success');
          toast({
            title: 'Welcome!',
            description: 'Successfully signed in with Google.',
          });

          setTimeout(() => { navigate('/dashboard'); }, 2000);
        } catch (error) {
          console.error('Token processing error:', error);
          setStatus('error');
          toast({
            title: 'Authentication Error',
            description: 'Failed to process authentication token.',
            variant: 'destructive',
          });
          setTimeout(() => { navigate('/login'); }, 3000);
        }
      } else {
        setStatus('error');
        toast({
          title: 'Authentication Error',
          description: 'No authentication token received.',
          variant: 'destructive',
        });
        setTimeout(() => { navigate('/login'); }, 3000);
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, toast, login]);

  const getStatusConfig = () => {
    switch (status) {
      case 'processing':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-blue-500" />,
          title: 'Processing Authentication',
          description: 'Please wait while we complete your sign-in...',
          color: 'text-blue-600',
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          title: 'Authentication Successful',
          description: 'Welcome! Redirecting you to your dashboard...',
          color: 'text-green-600',
        };
      case 'error':
        return {
          icon: <XCircle className="h-8 w-8 text-red-500" />,
          title: 'Authentication Failed',
          description: 'Redirecting you back to the login page...',
          color: 'text-red-600',
        };
      default:
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-blue-500" />,
          title: 'Processing',
          description: 'Please wait...',
          color: 'text-blue-600',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {statusConfig.icon}
          </div>
          <CardTitle className={`text-xl ${statusConfig.color}`}>
            {statusConfig.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            {statusConfig.description}
          </p>
          
          {status === 'processing' && (
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
