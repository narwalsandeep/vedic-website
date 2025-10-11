import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';
import { MenuContent } from '../../models/content.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  title = 'Welcome to Vedic Web';
  currentContent: MenuContent | null = null;
  isLoading = false;
  activeMenuId = 'home';

  constructor(private contentService: ContentService) {}

  ngOnInit() {
    this.loadContent('home');
  }

  loadContent(menuId: string) {
    this.isLoading = true;
    this.activeMenuId = menuId;
    
    // Find the menu item to get its endpoint
    const menuItem = this.findMenuItem(menuId);
    if (menuItem && menuItem.endpoint) {
      this.contentService.getContentByEndpoint(menuItem.endpoint).subscribe({
        next: (response) => {
          this.currentContent = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading content:', error);
          this.isLoading = false;
        }
      });
    } else {
      console.error('No endpoint found for menu:', menuId);
      this.isLoading = false;
    }
  }

  onMenuClick(menuId: string) {
    this.loadContent(menuId);
  }

  private findMenuItem(menuId: string): any {
    // Search in left menu items
    for (const item of this.leftMenuItems) {
      if (item.id === menuId) return item;
      for (const subitem of item.submenu) {
        if (subitem.id === menuId) return subitem;
      }
    }
    
    // Search in right menu items
    for (const item of this.rightMenuItems) {
      if (item.id === menuId) return item;
      for (const subitem of item.submenu) {
        if (subitem.id === menuId) return subitem;
      }
    }
    
    return null;
  }

  // Left menu items (4 items) - Updated with API endpoints using proxy
  leftMenuItems = [
    {
      title: 'Home',
      id: 'home',
      endpoint: '/api/home?_format=json',
      submenu: []
    },
    {
      title: 'Events',
      id: 'events',
      endpoint: '/api/event-manager?_format=json',
      submenu: []
    },
    {
      title: 'Activities',
      id: 'activities',
      endpoint: '/api/activity-manager?_format=json',
      submenu: []
    },
    {
      title: 'Temple',
      id: 'temple',
      endpoint: '/api/temple?_format=json',
      submenu: [
        { title: 'Temple', id: 'temple', endpoint: '/api/temple?_format=json' },
        { title: 'Priest', id: 'priest', endpoint: '/api/priest?_format=json' },
        { title: 'Prayer', id: 'prayer', endpoint: '/api/prayer?_format=json' }
      ]
    }
  ];

  // Right menu items (4 items) - Updated with API endpoints using proxy
  rightMenuItems = [
    {
      title: 'About Us',
      id: 'about-us',
      endpoint: '/api/about-us?_format=json',
      submenu: [
        { title: 'About Us', id: 'about-us', endpoint: '/api/about-us?_format=json' },
        { title: 'Objectives', id: 'objectives', endpoint: '/api/objectives?_format=json' },
        { title: 'Trustees', id: 'trustees', endpoint: '/api/trustees?_format=json' },
        { title: 'Legal', id: 'legal', endpoint: '/api/legal?_format=json' }
      ]
    },
    {
      title: 'Services',
      id: 'services',
      endpoint: '/api/services?_format=json',
      submenu: [
        { title: 'Services', id: 'services', endpoint: '/api/services?_format=json' },
        { title: 'School Visits', id: 'school-visits', endpoint: '/api/school-visits?_format=json' },
        { title: 'Booking Forms', id: 'booking-forms', endpoint: '/api/booking-forms?_format=json' }
      ]
    },
    {
      title: 'Join Us',
      id: 'join-us',
      endpoint: '/api/join-us?_format=json',
      submenu: [
        { title: 'Members', id: 'members', endpoint: '/api/members?_format=json' },
        { title: 'Volunteer', id: 'volunteer', endpoint: '/api/volunteer?_format=json' }
      ]
    },
    {
      title: 'More',
      id: 'more',
      endpoint: '/api/more?_format=json',
      submenu: [
        { title: 'Gallery', id: 'gallery', endpoint: '/api/gallery?_format=json' },
        { title: 'Contact', id: 'contact', endpoint: '/api/contact?_format=json' },
        { title: 'Blog', id: 'blog', endpoint: '/api/blog?_format=json' },
        { title: 'Sad Announcement', id: 'sad-announcement', endpoint: '/api/sad-announcements?_format=json' },
        { title: 'General Announcement', id: 'general-announcement', endpoint: '/api/general-announcements?_format=json' },
        { title: 'Feedback', id: 'feedback', endpoint: '/api/feedback?_format=json' }
      ]
    }
  ];

  // Additional menu item for Donate (standalone)
  donateMenuItem = {
    title: 'Donate',
    id: 'donate',
    endpoint: '/api/donate?_format=json',
    submenu: []
  };
}
