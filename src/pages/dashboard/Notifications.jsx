import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, UserPlus, Briefcase, Calendar, Bell, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { notificationService } from '../../api/notificationService';
import { useNotificationStore } from '../../store/notificationStore';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';

const getIconForType = (iconString) => {
  switch (iconString) {
    case 'user-plus': return <UserPlus size={24} />;
    case 'briefcase': return <Briefcase size={24} />;
    case 'calendar': return <Calendar size={24} />;
    case 'alert': return <AlertTriangle size={24} />;
    default: return <Bell size={24} />;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const { fetchUnreadCount, decrementUnreadCount, resetUnreadCount } = useNotificationStore();

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationService.getNotifications({ page: 1, limit: 50 });
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load notifications', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.preventDefault(); // Prevent navigating if it's a link wrapper
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        ));
        decrementUnreadCount();
      }
    } catch (error) {
      console.error('Failed to mark as read', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        resetUnreadCount();
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all as read', error);
      toast.error('Failed to mark all as read');
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Page Header */}
      <PageHeader
        title="Notifications"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Notifications' },
        ]}
      >
        <button 
          onClick={handleMarkAllAsRead}
          disabled={isMarkingAll || notifications.length === 0 || notifications.every(n => n.isRead)}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-full font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 shadow-xs cursor-pointer"
        >
          <CheckCircle2 size={16} />
          Mark all as read
        </button>
      </PageHeader>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Bell size={28} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No notifications yet</h3>
            <p className="text-gray-500 text-sm">When you get notifications, they'll show up here.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-5 rounded-2xl flex items-center justify-between transition-colors border ${notification.isRead ? 'bg-white border-gray-100' : 'bg-blue-50/30 border-[#225091]/20 hover:border-[#225091]/40'}`}
            >
              <div className="flex items-start gap-5">
                {/* Icon */}
                <div 
                  className="mt-1 p-3 rounded-full flex items-center justify-center shrink-0"
                  style={{ 
                    backgroundColor: notification.iconColor ? `${notification.iconColor}15` : '#22509115', 
                    color: notification.iconColor || '#225091' 
                  }}
                >
                  {getIconForType(notification.icon)}
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`text-base font-bold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#225091]"></span>
                    )}
                  </div>
                  <p className="text-gray-500 text-[15px] mb-2">{notification.description}</p>
                  <span className="text-xs font-medium text-gray-400">{notification.timestampText || 'Just Now'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-3 shrink-0 ml-4">
                {notification.actionUrl && (
                  <Link 
                    to={notification.actionUrl} 
                    className="text-[#225091] font-semibold text-sm hover:text-[#168f94] transition-colors whitespace-nowrap bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:shadow"
                  >
                    {notification.actionText || 'Check Now'}
                  </Link>
                )}
                {!notification.isRead && (
                  <button 
                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                    className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
