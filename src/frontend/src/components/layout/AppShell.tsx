import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import {
  Menu,
  Home,
  Users,
  User,
  Settings,
  LogOut,
  Ban,
} from 'lucide-react';
import FeedPage from '../../pages/FeedPage';
import FriendsPage from '../../pages/FriendsPage';
import ProfilePage from '../../pages/ProfilePage';
import SettingsPage from '../../pages/SettingsPage';
import { BlockedUsersPage } from '../../pages/BlockedUsersPage';
import { NetworkStatusIndicator } from '../system/NetworkStatusIndicator';

type Page = 'feed' | 'friends' | 'profile' | 'settings' | 'blocked';

export function AppShell() {
  const [currentPage, setCurrentPage] = useState<Page>('feed');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { clear } = useInternetIdentity();

  const handleLogout = async () => {
    await clear();
  };

  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'feed' as Page, label: 'Feed', icon: Home },
    { id: 'friends' as Page, label: 'Friends', icon: Users },
    { id: 'profile' as Page, label: 'Profile', icon: User },
    { id: 'blocked' as Page, label: 'Blocked', icon: Ban },
    { id: 'settings' as Page, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold">MetalHead</h1>
              <div className="flex gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={currentPage === item.id ? 'default' : 'ghost'}
                      onClick={() => handleNavigation(item.id)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NetworkStatusIndicator />
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-b bg-card">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold">MetalHead</h1>
          <div className="flex items-center gap-2">
            <NetworkStatusIndicator />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={currentPage === item.id ? 'default' : 'ghost'}
                        onClick={() => handleNavigation(item.id)}
                        className="justify-start gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="justify-start gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto">
        {currentPage === 'feed' && <FeedPage />}
        {currentPage === 'friends' && <FriendsPage />}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'blocked' && <BlockedUsersPage />}
      </main>
    </div>
  );
}
