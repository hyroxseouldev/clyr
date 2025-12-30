"use client";

import type { CoachProfile } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Instagram,
  Youtube,
  Globe,
  Phone,
  User,
  FileText,
  Award,
  Pencil,
  Trash2,
} from "lucide-react";

interface ProfileViewCardProps {
  profile: CoachProfile;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProfileViewCard({
  profile,
  onEdit,
  onDelete,
}: ProfileViewCardProps) {
  return (
    <div className="space-y-6">
      {/* 액션 버튼 */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          프로필 수정
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          프로필 삭제
        </Button>
      </div>

      {/* 기본 정보 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">닉네임</p>
            <p className="font-medium">
              {profile.nickname ?? <span className="text-muted-foreground">미입력</span>}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">한줄 소개</p>
            <p className="font-medium">
              {profile.introduction ?? <span className="text-muted-foreground">미입력</span>}
            </p>
          </div>
          {profile.contactNumber && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">연락처</p>
              <p className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {profile.contactNumber}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 경력 및 자격증 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            경력 및 자격증
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">코칭 경력</p>
            <p className="whitespace-pre-wrap">
              {profile.experience ?? <span className="text-muted-foreground">미입력</span>}
            </p>
          </div>
          {profile.certifications && profile.certifications.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">자격증</p>
              <div className="flex flex-wrap gap-2">
                {profile.certifications.map((cert) => (
                  <Badge key={cert} variant="secondary" className="gap-1">
                    <Award className="h-3 w-3" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SNS 링크 섹션 */}
      {(profile.snsLinks?.instagram ||
        profile.snsLinks?.youtube ||
        profile.snsLinks?.blog) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              SNS 링크
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.snsLinks?.instagram && (
              <a
                href={
                  profile.snsLinks.instagram.startsWith("http")
                    ? profile.snsLinks.instagram
                    : `https://instagram.com/${profile.snsLinks.instagram.replace("@", "")}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:underline"
              >
                <Instagram className="h-4 w-4 text-pink-500" />
                {profile.snsLinks.instagram}
              </a>
            )}
            {profile.snsLinks?.youtube && (
              <a
                href={profile.snsLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:underline"
              >
                <Youtube className="h-4 w-4 text-red-500" />
                YouTube 채널
              </a>
            )}
            {profile.snsLinks?.blog && (
              <a
                href={profile.snsLinks.blog}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:underline"
              >
                <Globe className="h-4 w-4 text-blue-500" />
                블로그
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
