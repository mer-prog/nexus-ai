"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  User,
  Bell,
  Palette,
  Globe,
  AlertTriangle,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThemeStore } from "@/stores/theme-store";
import { useToastStore } from "@/stores/toast-store";
import { useLocaleStore } from "@/stores/locale-store";
import { useT } from "@/hooks/use-translations";
import { useUserRole } from "@/hooks/use-user-role";

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function SettingsPage() {
  const userRole = useUserRole();
  const isAdmin = userRole === "ADMIN";
  const { theme, setTheme, initTheme } = useThemeStore();
  const { locale, setLocale: setAppLocale } = useLocaleStore();
  const t = useT("settings");
  const tc = useT("common");
  const addToast = useToastStore((s) => s.addToast);

  // Org settings
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);

  // Profile settings
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Notification settings (UI only)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // Danger zone
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const fetchSettings = useCallback(async () => {
    const [orgRes, profileRes] = await Promise.all([
      fetch("/api/settings/organization"),
      fetch("/api/settings/profile"),
    ]);

    if (orgRes.ok) {
      const data = await orgRes.json() as { organization: Organization };
      setOrg(data.organization);
      setOrgName(data.organization.name);
      setOrgSlug(data.organization.slug);
    }

    if (profileRes.ok) {
      const data = await profileRes.json() as { profile: Profile };
      setProfile(data.profile);
      setProfileName(data.profile.name);
      setProfileEmail(data.profile.email);
    }
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  async function handleSaveOrg() {
    setSavingOrg(true);
    try {
      const res = await fetch("/api/settings/organization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName, slug: orgSlug }),
      });
      if (res.ok) {
        const data = await res.json() as { organization: Organization };
        setOrg(data.organization);
        addToast({ title: t("orgUpdated"), description: t("orgUpdatedDesc") });
      } else {
        const err = await res.json() as { error: string };
        addToast({ title: tc("error"), description: err.error, variant: "destructive" });
      }
    } finally {
      setSavingOrg(false);
    }
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const body: Record<string, string> = {};
      if (profileName !== profile?.name) body.name = profileName;
      if (profileEmail !== profile?.email) body.email = profileEmail;
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      if (Object.keys(body).length === 0) {
        addToast({ title: t("noChanges"), description: t("noChangesDesc") });
        return;
      }

      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json() as { profile: Profile };
        setProfile(data.profile);
        setProfileName(data.profile.name);
        setProfileEmail(data.profile.email);
        setCurrentPassword("");
        setNewPassword("");
        addToast({ title: t("profileUpdated"), description: t("profileUpdatedDesc") });
      } else {
        const err = await res.json() as { error: string };
        addToast({ title: tc("error"), description: err.error, variant: "destructive" });
      }
    } finally {
      setSavingProfile(false);
    }
  }

  function handleDeleteOrg() {
    if (deleteStep === 0) {
      setDeleteStep(1);
    } else if (deleteStep === 1 && deleteConfirmText === org?.name) {
      setDeleteStep(0);
      setDeleteConfirmText("");
      addToast({
        title: t("orgDeletion"),
        description: t("orgDeletionDesc"),
      });
    }
  }

  function handleNotificationToggle(type: "email" | "push") {
    if (type === "email") {
      setEmailNotifications(!emailNotifications);
      addToast({
        title: t("notificationSetting"),
        description: t("emailToggle", { state: !emailNotifications ? t("enabled") : t("disabled") }),
      });
    } else {
      setPushNotifications(!pushNotifications);
      addToast({
        title: t("notificationSetting"),
        description: t("pushToggle", { state: !pushNotifications ? t("enabled") : t("disabled") }),
      });
    }
  }

  function handleLanguageChange(lang: string) {
    void setAppLocale(lang as "en" | "ja");
    addToast({
      title: t("languageChanged"),
      description: t("languageChangedDesc", { lang: lang === "en" ? "English" : "日本語" }),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Organization Settings */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>{t("organization")}</CardTitle>
                <CardDescription>{t("organizationDesc")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">{t("orgName")}</Label>
                <Input
                  id="org-name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-slug">{t("slug")}</Label>
                <Input
                  id="org-slug"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  placeholder={t("slugPlaceholder")}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => void handleSaveOrg()} disabled={savingOrg}>
              {savingOrg ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t("saveOrganization")}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>{t("profile")}</CardTitle>
              <CardDescription>{t("profileDesc")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">{t("name")}</Label>
              <Input
                id="profile-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">{t("email")}</Label>
              <Input
                id="profile-email"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
              />
            </div>
          </div>
          <Separator />
          <p className="text-sm font-medium">{t("changePassword")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current-pw">{t("currentPassword")}</Label>
              <Input
                id="current-pw"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">{t("newPassword")}</Label>
              <Input
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("minChars")}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => void handleSaveProfile()} disabled={savingProfile}>
            {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {t("saveProfile")}
          </Button>
        </CardFooter>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>{t("notifications")}</CardTitle>
              <CardDescription>{t("notificationsDesc")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t("emailNotifications")}</p>
              <p className="text-xs text-muted-foreground">{t("emailNotificationsDesc")}</p>
            </div>
            <button
              role="switch"
              aria-checked={emailNotifications}
              onClick={() => handleNotificationToggle("email")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailNotifications ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  emailNotifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t("pushNotifications")}</p>
              <p className="text-xs text-muted-foreground">{t("pushNotificationsDesc")}</p>
            </div>
            <button
              role="switch"
              aria-checked={pushNotifications}
              onClick={() => handleNotificationToggle("push")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                pushNotifications ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  pushNotifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>{t("appearance")}</CardTitle>
              <CardDescription>{t("appearanceDesc")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>{t("theme")}</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("themeLight")}</SelectItem>
                <SelectItem value="dark">{t("themeDark")}</SelectItem>
                <SelectItem value="system">{t("themeSystem")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>{t("language")}</CardTitle>
              <CardDescription>{t("languageDesc")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>{t("displayLanguage")}</Label>
            <Select value={locale} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t("english")}</SelectItem>
                <SelectItem value="ja">{t("japanese")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isAdmin && (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <CardTitle className="text-destructive">{t("dangerZone")}</CardTitle>
                <CardDescription>
                  {t("dangerZoneDesc")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-md border border-destructive/50 p-4">
              <div>
                <p className="text-sm font-medium">{t("deleteOrganization")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("deleteOrgDesc", { name: org?.name ?? "" })}
                </p>
              </div>
              <Button variant="destructive" onClick={() => setDeleteStep(1)}>
                {tc("delete")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation - Step 1 */}
      <AlertDialog open={deleteStep === 1} onOpenChange={() => setDeleteStep(0)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteOrgWarning", { name: org?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteStep(0)}>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => setDeleteStep(2)}
            >
              {t("continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation - Step 2 */}
      <AlertDialog open={deleteStep === 2} onOpenChange={() => { setDeleteStep(0); setDeleteConfirmText(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("finalConfirmation")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("typeToConfirm", { name: org?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={org?.name}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDeleteStep(0); setDeleteConfirmText(""); }}>
              {tc("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteOrg}
              disabled={deleteConfirmText !== org?.name}
            >
              {t("deleteOrganization")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
