import { useState } from 'react';
import { Button } from './ui/button';
import { Chrome } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

// Google Identity Services script loader
const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve(window.google);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        resolve(window.google);
      } else {
        reject(new Error('Google script failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Google script failed to load'));
    document.head.appendChild(script);
  });
};

const GoogleLoginButton = ({ onSuccess, onError, disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      // Load Google script if not already loaded
      await loadGoogleScript();

      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Show the One Tap dialog
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup if One Tap is not available
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            {
              theme: 'outline',
              size: 'large',
              width: '100%',
            }
          );
          
          // If no button container, show popup directly
          if (!document.getElementById('google-signin-button')) {
            showGooglePopup();
          }
        }
      });
    } catch (error) {
      console.error('Google login error:', error);
      setIsLoading(false);
      toast({
        title: 'Authentication Error',
        description: 'Failed to initialize Google authentication. Please try again.',
        variant: 'destructive',
      });
      onError?.(error);
    }
  };

  const showGooglePopup = () => {
    window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: async (response) => {
        if (response.access_token) {
          try {
            // Get user info using the access token
            const userInfoResponse = await fetch(
              `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`
            );
            const userInfo = await userInfoResponse.json();
            
            // Send user info to backend
            await authenticateWithBackend({
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
              googleId: userInfo.id,
              verified: userInfo.verified_email,
            });
          } catch (error) {
            console.error('Error getting user info:', error);
            setIsLoading(false);
            onError?.(error);
          }
        }
      },
    }).requestAccessToken();
  };

  const handleCredentialResponse = async (response) => {
    try {
      // Send the JWT token to backend for verification
      await authenticateWithBackend({ idToken: response.credential });
    } catch (error) {
      console.error('Error handling credential response:', error);
      setIsLoading(false);
      onError?.(error);
    }
  };

  const authenticateWithBackend = async (authData) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      });

      const data = await response.json();

      if (data.success) {
        // Store the JWT token
        localStorage.setItem('token', data.data.token);
        
        toast({
          title: 'Welcome!',
          description: 'Successfully signed in with Google.',
        });

        onSuccess?.(data.data);
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Backend authentication error:', error);
      toast({
        title: 'Authentication Failed',
        description: error.message || 'Failed to authenticate with Google. Please try again.',
        variant: 'destructive',
      });
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={disabled || isLoading}
      >
        <Chrome className="h-4 w-4 mr-2" />
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </Button>
      
      {/* Hidden container for Google button rendering */}
      <div id="google-signin-button" className="hidden"></div>
    </div>
  );
};

export default GoogleLoginButton;
