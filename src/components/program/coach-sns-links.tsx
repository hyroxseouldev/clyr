/**
 * Coach SNS Links Component
 * Displays social media links with icons for Instagram, YouTube, and Blog
 */

import { Button } from "@/components/ui/button";
import { Instagram, Youtube, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface SnsLinks {
  instagram?: string;
  youtube?: string;
  blog?: string;
}

interface CoachSnsLinksProps {
  snsLinks: SnsLinks;
  labels: {
    instagram: string;
    youtube: string;
    blog: string;
  };
  className?: string;
}

export function CoachSnsLinks({
  snsLinks,
  labels,
  className,
}: CoachSnsLinksProps) {
  const links = [
    {
      platform: "instagram",
      url: snsLinks.instagram,
      icon: Instagram,
      label: labels.instagram,
      color: "hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200",
    },
    {
      platform: "youtube",
      url: snsLinks.youtube,
      icon: Youtube,
      label: labels.youtube,
      color: "hover:bg-red-50 hover:text-red-600 hover:border-red-200",
    },
    {
      platform: "blog",
      url: snsLinks.blog,
      icon: FileText,
      label: labels.blog,
      color: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200",
    },
  ].filter((link) => link.url);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Button
            key={link.platform}
            variant="outline"
            size="sm"
            asChild
            className={cn(
              "gap-2 border-gray-200 text-gray-700 transition-colors",
              link.color
            )}
          >
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </a>
          </Button>
        );
      })}
    </div>
  );
}
