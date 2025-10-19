import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Map,
  Radio,
  MessageSquare,
  BarChart3,
  Settings,
  Home,
  AlertTriangle
} from 'lucide-react';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'telemetry', label: 'Live Telemetry', icon: Activity },
  { id: 'track', label: '3D Track Map', icon: Map },
  { id: 'radio', label: 'Team Radio', icon: Radio },
  { id: 'strategy', label: 'Strategy Chat', icon: MessageSquare },
  { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ activeSection = 'dashboard', onSectionChange }) => {
  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50"
      initial={{ x: -264 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Activity className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">F1 Race Control</h1>
            <p className="text-xs text-sidebar-foreground/60">Live Telemetry System</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => onSectionChange?.(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium
                  transition-all duration-150
                  ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ x: isActive ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 w-1 h-8 bg-sidebar-primary-foreground rounded-r-full"
                    layoutId="activeIndicator"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                <span>{item.label}</span>

                {item.id === 'anomalies' && (
                  <motion.span
                    className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    3
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <motion.div
          className="flex items-center gap-3 px-3 py-2 rounded-md bg-sidebar-accent"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.15 }}
        >
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center">
            <span className="text-xs font-bold text-sidebar-primary-foreground">RC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Race Control</p>
            <p className="text-xs text-sidebar-foreground/60">Engineer Mode</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
