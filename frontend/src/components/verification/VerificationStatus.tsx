import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, AlertCircle } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorAlert } from "@/components/ui/error-alert"

interface VerificationStatusProps {
  level: 'none' | 'basic' | 'community' | 'financial' | 'governance';
  onStartVerification: () => void;
}

export function VerificationStatus({ 
  level, 
  onStartVerification,
  isLoading,
  error 
}: VerificationStatusProps & { 
  isLoading?: boolean;
  error?: string;
}) {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  const statusInfo = {
    none: {
      title: "Not Verified",
      description: "Start your verification process",
      icon: AlertCircle,
      color: "text-red-500"
    },
    basic: {
      title: "Basic Verification",
      description: "Email and phone verified",
      icon: Shield,
      color: "text-yellow-500"
    },
    community: {
      title: "Community Verified",
      description: "Rabbi reference verified",
      icon: Shield,
      color: "text-blue-500"
    },
    financial: {
      title: "Financial Trust",
      description: "KYC and video verification complete",
      icon: Shield,
      color: "text-purple-500"
    },
    governance: {
      title: "Governance Trust",
      description: "Multi-party verification complete",
      icon: CheckCircle,
      color: "text-green-500"
    }
  };

  const { title, description, icon: Icon, color } = statusInfo[level];

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className={color} />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {level !== 'governance' && (
          <Button 
            onClick={onStartVerification}
            className="w-full"
          >
            Continue Verification
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
