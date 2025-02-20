import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, AlertCircle } from "lucide-react"

interface VerificationStatusProps {
  level: 'none' | 'basic' | 'verified' | 'complete';
  onStartVerification: () => void;
}

export function VerificationStatus({ level, onStartVerification }: VerificationStatusProps) {
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
    verified: {
      title: "Identity Verified",
      description: "Documents and KYC complete",
      icon: Shield,
      color: "text-blue-500"
    },
    complete: {
      title: "Fully Verified",
      description: "All verifications complete",
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
        {level !== 'complete' && (
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
