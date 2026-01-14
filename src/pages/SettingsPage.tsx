import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  Palette,
  Check,
  Crown
} from 'lucide-react';
import { MainLayout, Header } from '../components/layout';
import { Button, Input } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { clsx } from 'clsx';

type SettingsTab = 'profile' | 'subscription' | 'notifications' | 'security' | 'appearance';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast, isDarkMode, toggleDarkMode } = useUIStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'subscription' as const, label: 'Subscription', icon: CreditCard },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  ];

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Open-source models only',
        'Basic multimodal support',
        '50 messages/day',
        'Community support',
      ],
      current: user?.plan === 'free',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19',
      period: '/month',
      features: [
        'All AI models (GPT-4, Claude, etc.)',
        'Full multimodal capabilities',
        'Unlimited messages',
        'Priority support',
        'Custom prompts',
        'API access',
      ],
      current: user?.plan === 'pro',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: [
        'Everything in Pro',
        'Dedicated instance',
        'Custom model fine-tuning',
        'SLA guarantee',
        'SSO & SAML',
        'Dedicated support',
      ],
      current: user?.plan === 'enterprise',
    },
  ];

  const handleSave = () => {
    addToast({
      type: 'success',
      title: 'Settings saved',
      message: 'Your changes have been saved successfully.',
    });
  };

  return (
    <MainLayout>
      <Header title="Settings" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-void-400 hover:text-void-200 
                     transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex gap-8">
            {/* Sidebar */}
            <nav className="w-48 flex-shrink-0">
              <ul className="space-y-1">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg',
                        'transition-colors text-left',
                        activeTab === tab.id
                          ? 'bg-olympus-500/10 text-olympus-400 border border-olympus-500/30'
                          : 'text-void-400 hover:text-void-200 hover:bg-void-800/50'
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Content */}
            <div className="flex-1 card">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-void-100 mb-1">Profile</h2>
                    <p className="text-sm text-void-500">Manage your account details</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-olympus-500 to-olympus-700 
                                  flex items-center justify-center text-void-950 font-bold text-2xl">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <Button variant="secondary" size="sm">Change Photo</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      defaultValue={user?.name}
                      placeholder="John Doe"
                    />
                    <Input
                      label="Email"
                      type="email"
                      defaultValue={user?.email}
                      placeholder="you@example.com"
                      disabled
                    />
                  </div>

                  <Button variant="primary" onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              )}

              {activeTab === 'subscription' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-void-100 mb-1">Subscription</h2>
                    <p className="text-sm text-void-500">Manage your plan and billing</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={clsx(
                          'relative p-5 rounded-xl border transition-all',
                          plan.current
                            ? 'bg-olympus-500/10 border-olympus-500/30'
                            : 'bg-void-800/30 border-void-700 hover:border-void-600'
                        )}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 
                                        bg-olympus-500 text-void-950 text-xs font-medium rounded-full">
                            Most Popular
                          </div>
                        )}

                        {plan.current && (
                          <div className="absolute top-4 right-4">
                            <div className="w-5 h-5 rounded-full bg-olympus-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-void-950" />
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-void-100 flex items-center gap-2">
                            {plan.name}
                            {plan.id === 'enterprise' && <Crown className="w-4 h-4 text-purple-400" />}
                          </h3>
                          <div className="mt-2">
                            <span className="text-2xl font-bold text-void-100">{plan.price}</span>
                            <span className="text-void-500">{plan.period}</span>
                          </div>
                        </div>

                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-void-400">
                              <Check className="w-4 h-4 text-olympus-400 flex-shrink-0 mt-0.5" />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <Button
                          variant={plan.current ? 'secondary' : 'primary'}
                          className="w-full"
                          disabled={plan.current}
                        >
                          {plan.current ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-void-100 mb-1">Notifications</h2>
                    <p className="text-sm text-void-500">Configure how you receive updates</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { title: 'Email notifications', desc: 'Receive updates via email' },
                      { title: 'Product updates', desc: 'News about features and improvements' },
                      { title: 'Usage alerts', desc: 'Get notified when approaching limits' },
                    ].map((item, i) => (
                      <label
                        key={i}
                        className="flex items-center justify-between p-4 rounded-lg 
                                 bg-void-800/30 border border-void-700 cursor-pointer
                                 hover:bg-void-800/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-void-200">{item.title}</p>
                          <p className="text-sm text-void-500">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked={i === 0}
                          className="w-5 h-5 rounded border-void-600 bg-void-800 
                                   text-olympus-500 focus:ring-olympus-500/30"
                        />
                      </label>
                    ))}
                  </div>

                  <Button variant="primary" onClick={handleSave}>
                    Save Preferences
                  </Button>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-void-100 mb-1">Security</h2>
                    <p className="text-sm text-void-500">Protect your account</p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      placeholder="Enter current password"
                    />
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="Enter new password"
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <Button variant="primary" onClick={handleSave}>
                    Update Password
                  </Button>

                  <hr className="border-void-700" />

                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <h3 className="font-medium text-red-400 mb-2">Danger Zone</h3>
                    <p className="text-sm text-void-400 mb-4">
                      Once you delete your account, there is no going back.
                    </p>
                    <Button variant="danger" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-void-100 mb-1">Appearance</h2>
                    <p className="text-sm text-void-500">Customize your experience</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg 
                                  bg-void-800/30 border border-void-700">
                      <div>
                        <p className="font-medium text-void-200">Dark Mode</p>
                        <p className="text-sm text-void-500">Use dark theme</p>
                      </div>
                      <button
                        onClick={toggleDarkMode}
                        className={clsx(
                          'relative w-12 h-6 rounded-full transition-colors',
                          isDarkMode ? 'bg-olympus-500' : 'bg-void-600'
                        )}
                      >
                        <div
                          className={clsx(
                            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                            isDarkMode ? 'translate-x-7' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
