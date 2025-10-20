import { Component, OnInit, AfterViewInit } from '@angular/core';
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
export class LandingComponent implements OnInit, AfterViewInit {
  title = 'Welcome to Vedic Web';
  currentContent: MenuContent | null = null;
  isLoading = false;
  activeMenuId = 'home';
  selectedGalleryImages: string[] = [];
  selectedGalleryIndex: number = 0;
  currentGalleryModalId: string = '';

  constructor(private contentService: ContentService) {}

  ngOnInit() {
    this.loadContent('home');
  }

  ngAfterViewInit() {
    // Component lifecycle hook
  }

  loadContent(menuId: string) {
    this.isLoading = true;
    this.activeMenuId = menuId;
    
    // Handle home page statically (no API call needed)
    if (menuId === 'home') {
      this.currentContent = {
        id: 'home',
        title: 'Welcome to Vedic Temple',
        description: 'Your spiritual home for worship, community and growth',
        type: 'page',
        content: ''
      };
      this.isLoading = false;
      return;
    }
    
    // Find the menu item to get its endpoint
    const menuItem = this.findMenuItem(menuId);
    if (menuItem && menuItem.endpoint) {
      const endpoint = menuItem.endpoint;
      const filterMenuItem = (menuItem as any).filterMenuItem;
      
      this.contentService.getContentByEndpoint(endpoint, filterMenuItem, menuId).subscribe({
        next: (response) => {
          this.currentContent = response.data;
          console.log('Content loaded for menuId:', menuId, 'Data:', this.currentContent);
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
    this.closeNavbar();
  }

  private closeNavbar(): void {
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      const navbar = document.querySelector('.navbar-toggler') as HTMLElement;
      if (navbar) {
        navbar.click();
      }
    }
  }

  openGalleryImage(images: string[], index: number, modalId: string): void {
    this.selectedGalleryImages = images;
    this.selectedGalleryIndex = index;
    this.currentGalleryModalId = modalId;
  }

  previousGalleryImage(): void {
    if (this.selectedGalleryIndex > 0) {
      this.selectedGalleryIndex--;
    } else {
      this.selectedGalleryIndex = this.selectedGalleryImages.length - 1;
    }
  }

  nextGalleryImage(): void {
    if (this.selectedGalleryIndex < this.selectedGalleryImages.length - 1) {
      this.selectedGalleryIndex++;
    } else {
      this.selectedGalleryIndex = 0;
    }
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

  // Left menu items (4 items) - API endpoints (base URL added by service based on environment)
  leftMenuItems = [
    {
      title: 'Home',
      id: 'home',
      endpoint: '/home?_format=json',
      submenu: []
    },
    {
      title: 'Events',
      id: 'events',
      endpoint: '/events-management?_format=json',
      submenu: []
    },
    {
      title: 'Activities',
      id: 'activities',
      endpoint: '/activity-manager?_format=json',
      submenu: []
    },
    // Temple menu uses article endpoint with different filters
    // Content service filters articles by field_menu_item value
    {
      title: 'Temple',
      id: 'temple',
      endpoint: '/article?_format=json',
      filterMenuItem: 'The Shrines',
      submenu: [
        { title: 'Shrines', id: 'shrines', endpoint: '/article?_format=json', filterMenuItem: 'The Shrines' },
        { title: 'Priest', id: 'priest', endpoint: '/article?_format=json', filterMenuItem: 'Priest' },
        { title: 'Prayer', id: 'prayer', endpoint: '/prayers?_format=json' },
        { title: 'Gallery', id: 'gallery', endpoint: '/events-gallery?_format=json' }
      ]
    }
  ];

  // Right menu items (4 items) - API endpoints (base URL added by service based on environment)
  rightMenuItems = [
    {
      title: 'About Us',
      id: 'about-us',
      endpoint: '/about-us?_format=json',
      submenu: [
//        { title: 'About Us', id: 'about-us', endpoint: '/about-us?_format=json' },
        { title: 'Objectives', id: 'objectives', endpoint: '/article?_format=json', filterMenuItem: 'Objective' },
        { title: 'Trustees', id: 'trustees', endpoint: '/trustee-management?_format=json' },
        { title: 'Legal', id: 'legal', endpoint: '/article?_format=json', filterMenuItem: 'Legal' }
      ]
    },
    {
      title: 'Services',
      id: 'services',
      endpoint: '/services?_format=json',
      submenu: [
        { title: 'Services', id: 'services', endpoint: '/services?_format=json' },
        { title: 'School Visits', id: 'school-visits', endpoint: '/article?_format=json', filterMenuItem: 'School Visits' },
        { title: 'Forms & Information', id: 'booking-forms', endpoint: '/booking-forms?_format=json' }
      ]
    },
    {
      title: 'Join Us',
      id: 'join-us',
      endpoint: '/join-us?_format=json',
      submenu: [
        { title: 'Members', id: 'members', endpoint: '/article?_format=json', filterMenuItem: 'Become A Member' },
        { title: 'Volunteer', id: 'volunteer', endpoint: '/article?_format=json', filterMenuItem: 'Vedic Volunteer' },
        { title: 'Contact', id: 'contact', endpoint: '/article?_format=json', filterMenuItem: 'Contact' }
      ]
    },
    {
      title: 'Donate',
      id: 'donate',
      endpoint: '/article?_format=json',
      filterMenuItem: 'Donate',
      submenu: []
    },
    {
      title: 'More',
      id: 'more',
      endpoint: '/more?_format=json',
      submenu: [
//        { title: 'Blog', id: 'blog', endpoint: '/blog?_format=json' },
        { title: 'Sad Announcement', id: 'sad-announcement', endpoint: '/sad-announcements?_format=json' },
        { title: 'General Announcement', id: 'general-announcement', endpoint: '/general-announcements?_format=json' },
//        { title: 'Feedback', id: 'feedback', endpoint: '/feedback?_format=json' }
      ]
    }
  ];

  // Helper method to group trustees by category/designation
  groupTrusteesByCategory(): { [category: string]: any[] } {
    if (!this.currentContent?.items) {
      return {};
    }
    
    const grouped: { [category: string]: any[] } = {};
    this.currentContent.items.forEach(trustee => {
      const category = trustee.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(trustee);
    });
    
    return grouped;
  }

  // Helper method to get category keys in sorted order
  getCategoryKeys(): string[] {
    const grouped = this.groupTrusteesByCategory();
    const keys = Object.keys(grouped);
    
    // Define preferred order
    const order = ['Holding Trustee - Chair', 'Holding Trustee', 'Executive Committee member', 'Other'];
    
    return keys.sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      
      // If both are in the order array, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only a is in the order, it comes first
      if (indexA !== -1) {
        return -1;
      }
      // If only b is in the order, it comes first
      if (indexB !== -1) {
        return 1;
      }
      // Otherwise, sort alphabetically
      return a.localeCompare(b);
    });
  }
}
