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

  // Left menu items (4 items) - Updated with English-only API endpoints
  leftMenuItems = [
    {
      title: 'Home',
      id: 'home',
      endpoint: 'https://jsonplaceholder.typicode.com/posts/1',
      submenu: []
    },
    {
      title: 'Events',
      id: 'events',
      endpoint: 'https://jsonplaceholder.typicode.com/posts?_limit=6',
      submenu: []
    },
    {
      title: 'Activities',
      id: 'activities',
      endpoint: 'https://jsonplaceholder.typicode.com/users?_limit=6',
      submenu: []
    },
    {
      title: 'Temple',
      id: 'temple',
      endpoint: 'https://jsonplaceholder.typicode.com/posts/2',
      submenu: [
        { title: 'Temple', id: 'temple', endpoint: 'https://jsonplaceholder.typicode.com/posts/2' },
        { title: 'Priest', id: 'priest', endpoint: 'https://jsonplaceholder.typicode.com/users/1' }
      ]
    }
  ];

  // Right menu items (4 items) - Updated with English-only API endpoints
  rightMenuItems = [
    {
      title: 'About Us',
      id: 'about-us',
      endpoint: 'https://jsonplaceholder.typicode.com/posts/3',
      submenu: [
        { title: 'About Us', id: 'about-us', endpoint: 'https://jsonplaceholder.typicode.com/posts/3' },
        { title: 'Objectives', id: 'objectives', endpoint: 'https://jsonplaceholder.typicode.com/posts/4' },
        { title: 'Trustees', id: 'trustees', endpoint: 'https://jsonplaceholder.typicode.com/users/2' },
        { title: 'Legal', id: 'legal', endpoint: 'https://jsonplaceholder.typicode.com/posts/5' }
      ]
    },
    {
      title: 'Services',
      id: 'services',
      endpoint: 'https://jsonplaceholder.typicode.com/posts/6',
      submenu: [
        { title: 'Services', id: 'services', endpoint: 'https://jsonplaceholder.typicode.com/posts/6' },
        { title: 'School Visits', id: 'school-visits', endpoint: 'https://jsonplaceholder.typicode.com/posts/7' }
      ]
    },
    {
      title: 'Join Us',
      id: 'join-us',
      endpoint: 'https://jsonplaceholder.typicode.com/posts/8',
      submenu: [
        { title: 'Members', id: 'members', endpoint: 'https://jsonplaceholder.typicode.com/users/3' },
        { title: 'Volunteer', id: 'volunteer', endpoint: 'https://jsonplaceholder.typicode.com/posts/9' }
      ]
    },
    {
      title: 'More',
      id: 'more',
      endpoint: 'https://jsonplaceholder.typicode.com/posts/10',
      submenu: [
        { title: 'Gallery', id: 'gallery', endpoint: 'https://jsonplaceholder.typicode.com/albums/1/photos?_limit=12' },
        { title: 'Contact', id: 'contact', endpoint: 'https://jsonplaceholder.typicode.com/users/4' },
        { title: 'Announcements', id: 'announcements', endpoint: 'https://jsonplaceholder.typicode.com/posts?_limit=8' }
      ]
    }
  ];
}
