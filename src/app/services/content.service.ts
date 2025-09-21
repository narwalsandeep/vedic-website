import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { MenuContent, MenuApiResponse } from '../models/content.model';

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  constructor(private http: HttpClient) { }

  // New method to get content by API endpoint
  getContentByEndpoint(endpoint: string): Observable<MenuApiResponse> {
    return this.http.get<any>(endpoint).pipe(
      map(apiResponse => this.transformApiResponse(apiResponse, endpoint)),
      catchError(error => {
        console.error('API Error:', error);
        return of({
          success: false,
          data: {
            id: 'error',
            title: 'Content Not Available',
            description: 'Unable to load content from the server.',
            type: 'page' as const,
            content: '<p>This content is temporarily unavailable. Please try again later.</p>'
          },
          message: 'Failed to fetch content from API'
        });
      })
    );
  }

  // Transform API response to our MenuContent format
  private transformApiResponse(apiResponse: any, endpoint: string): MenuApiResponse {
    // Handle different API response formats based on endpoint
    if (endpoint.includes('posts/') && !Array.isArray(apiResponse)) {
      // Single post response
      return {
        success: true,
        data: {
          id: apiResponse.id.toString(),
          title: apiResponse.title || 'Temple Information',
          description: apiResponse.body ? apiResponse.body.substring(0, 150) + '...' : 'Learn more about our temple community and spiritual services.',
          type: 'page' as const,
          content: this.generatePageContent(apiResponse)
        }
      };
    } else if (endpoint.includes('posts') && Array.isArray(apiResponse)) {
      // Multiple posts response
      return {
        success: true,
        data: {
          id: 'posts-list',
          title: 'Temple Events & News',
          description: 'Latest updates and events from our temple community',
          type: 'list' as const,
          items: apiResponse.slice(0, 6).map((post: any) => ({
            id: post.id.toString(),
            title: post.title || 'Community Event',
            description: post.body ? post.body.substring(0, 100) + '...' : 'Join us for this special community gathering and spiritual celebration.',
            image: `https://picsum.photos/400/200?random=${post.id}`,
            link: '#'
          }))
        }
      };
    } else if (endpoint.includes('users/') && !Array.isArray(apiResponse)) {
      // Single user response
      return {
        success: true,
        data: {
          id: apiResponse.id.toString(),
          title: apiResponse.name || 'Temple Member Profile',
          description: `Community member contact information and spiritual services`,
          type: 'page' as const,
          content: this.generateUserContent(apiResponse)
        }
      };
    } else if (endpoint.includes('users') && Array.isArray(apiResponse)) {
      // Multiple users response
      return {
        success: true,
        data: {
          id: 'users-list',
          title: 'Temple Community Members',
          description: 'Meet our dedicated community members and spiritual leaders',
          type: 'list' as const,
          items: apiResponse.slice(0, 6).map((user: any) => ({
            id: user.id.toString(),
            title: user.name || 'Community Member',
            description: `Active member providing spiritual guidance and community support`,
            image: `https://i.pravatar.cc/150?img=${user.id}`,
            link: '#'
          }))
        }
      };
    } else if (endpoint.includes('photos') && Array.isArray(apiResponse)) {
      // Photos/Gallery response
      return {
        success: true,
        data: {
          id: 'gallery',
          title: 'Temple Photo Gallery',
          description: 'Beautiful moments and celebrations from our temple community',
          type: 'gallery' as const,
          images: apiResponse.slice(0, 12).map((photo: any) => photo.thumbnailUrl || photo.url)
        }
      };
    } else {
      // Fallback for unknown response format
      return {
        success: true,
        data: {
          id: 'unknown',
          title: 'Temple Information',
          description: 'Additional content and resources for our community',
          type: 'page' as const,
          content: `<div class="hero-section"><h2>Temple Resources</h2><p>Additional information and resources for our community members.</p></div>`
        }
      };
    }
  }

  private generatePageContent(post: any): string {
    const englishTitle = post.title || 'Welcome to Our Temple';
    const englishContent = post.body || 'This is a sample content for our temple website. We provide spiritual guidance, community services, and cultural events for all members.';
    
    return `
      <div class="hero-section">
        <h2>${englishTitle}</h2>
        <p>${englishContent}</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <h3>Spiritual Services</h3>
          <p>Daily prayers, meditation sessions, and spiritual guidance for all community members.</p>
        </div>
        <div class="feature-card">
          <h3>Community Events</h3>
          <p>Regular cultural celebrations, festivals, and community gatherings throughout the year.</p>
        </div>
        <div class="feature-card">
          <h3>Educational Programs</h3>
          <p>Scripture study classes, cultural education, and youth programs for all ages.</p>
        </div>
      </div>
    `;
  }

  private generateUserContent(user: any): string {
    const userName = user.name || 'Temple Member';
    const userEmail = user.email || 'contact@temple.org';
    const userPhone = user.phone || '(555) 123-4567';
    const userAddress = user.address ? `${user.address.street}, ${user.address.city}` : 'Temple Address Available';
    const userCompany = user.company ? user.company.name : 'Temple Community';
    
    return `
      <div class="hero-section">
        <h2>${userName}</h2>
        <p>Community member and spiritual guide</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <h3>Contact Information</h3>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Phone:</strong> ${userPhone}</p>
          <p><strong>Role:</strong> Temple Community Member</p>
        </div>
        <div class="feature-card">
          <h3>Location</h3>
          <p>${userAddress}</p>
          <p><strong>Community:</strong> Local Temple Area</p>
        </div>
        <div class="feature-card">
          <h3>Community Involvement</h3>
          <p>Active member of ${userCompany}</p>
          <p><strong>Services:</strong> Spiritual guidance and community support</p>
        </div>
      </div>
    `;
  }

  // Legacy method - keeping for backward compatibility
  getContentByMenu(menuId: string): Observable<MenuApiResponse> {
    // Static data for now - will be replaced with HTTP calls
    const staticData: { [key: string]: MenuContent } = {
      'home': {
        id: 'home',
        title: 'Welcome to Vedic Temple',
        description: 'Experience the divine spirituality and cultural heritage at our temple.',
        type: 'page',
        content: `
          <div class="hero-section">
            <h2>Welcome to Our Sacred Space</h2>
            <p>Join us in prayer, community, and spiritual growth. Our temple serves as a beacon of faith and tradition.</p>
          </div>
          <div class="features-grid">
            <div class="feature-card">
              <h3>Daily Prayers</h3>
              <p>Morning and evening prayers conducted daily</p>
            </div>
            <div class="feature-card">
              <h3>Community Events</h3>
              <p>Regular cultural and spiritual gatherings</p>
            </div>
            <div class="feature-card">
              <h3>Education Programs</h3>
              <p>Learn about our traditions and scriptures</p>
            </div>
          </div>
        `
      },
      'events': {
        id: 'events',
        title: 'Upcoming Events',
        description: 'Join us for our upcoming spiritual and cultural events.',
        type: 'list',
        items: [
          {
            id: '1',
            title: 'Weekly Prayer Meeting',
            description: 'Every Sunday at 10:00 AM',
            image: '/assets/images/prayer-meeting.jpg'
          },
          {
            id: '2',
            title: 'Festival Celebration',
            description: 'Diwali celebration on November 12th',
            image: '/assets/images/festival.jpg'
          },
          {
            id: '3',
            title: 'Youth Program',
            description: 'Cultural activities for young members',
            image: '/assets/images/youth-program.jpg'
          }
        ]
      },
      'activities': {
        id: 'activities',
        title: 'Temple Activities',
        description: 'Various activities and programs we offer.',
        type: 'list',
        items: [
          {
            id: '1',
            title: 'Meditation Classes',
            description: 'Learn traditional meditation techniques',
            image: '/assets/images/meditation.jpg'
          },
          {
            id: '2',
            title: 'Scripture Study',
            description: 'Study of sacred texts and scriptures',
            image: '/assets/images/scripture-study.jpg'
          },
          {
            id: '3',
            title: 'Community Service',
            description: 'Volunteer opportunities and charity work',
            image: '/assets/images/community-service.jpg'
          }
        ]
      },
      'temple': {
        id: 'temple',
        title: 'About Our Temple',
        description: 'Learn about the history and significance of our temple.',
        type: 'page',
        content: `
          <div class="temple-info">
            <h3>Our Sacred Heritage</h3>
            <p>Founded in 1985, our temple has been a cornerstone of the community for over three decades.</p>
            <p>We are dedicated to preserving ancient traditions while fostering a welcoming environment for all.</p>
          </div>
          <div class="temple-features">
            <h3>Temple Features</h3>
            <ul>
              <li>Main prayer hall with capacity for 500 devotees</li>
              <li>Traditional architecture and sacred idols</li>
              <li>Community center for events and gatherings</li>
              <li>Library with extensive collection of religious texts</li>
            </ul>
          </div>
        `
      },
      'priest': {
        id: 'priest',
        title: 'Meet Our Priests',
        description: 'Our dedicated spiritual leaders and their services.',
        type: 'list',
        items: [
          {
            id: '1',
            title: 'Swami Rajesh',
            description: 'Head Priest - 15 years of service',
            image: '/assets/images/priest1.jpg'
          },
          {
            id: '2',
            title: 'Swami Priya',
            description: 'Assistant Priest - Specializes in ceremonies',
            image: '/assets/images/priest2.jpg'
          }
        ]
      },
      'about-us': {
        id: 'about-us',
        title: 'About Our Community',
        description: 'Learn about our mission, values, and community.',
        type: 'page',
        content: `
          <div class="about-section">
            <h3>Our Mission</h3>
            <p>To provide a spiritual home for our community, preserving ancient traditions while building bridges of understanding and compassion.</p>
            
            <h3>Our Values</h3>
            <ul>
              <li>Spiritual growth and enlightenment</li>
              <li>Community service and charity</li>
              <li>Cultural preservation and education</li>
              <li>Inclusivity and welcoming all</li>
            </ul>
          </div>
        `
      },
      'services': {
        id: 'services',
        title: 'Temple Services',
        description: 'Various services and ceremonies we offer.',
        type: 'list',
        items: [
          {
            id: '1',
            title: 'Daily Prayers',
            description: 'Morning and evening prayers',
            image: '/assets/images/daily-prayers.jpg'
          },
          {
            id: '2',
            title: 'Wedding Ceremonies',
            description: 'Traditional wedding ceremonies',
            image: '/assets/images/wedding.jpg'
          },
          {
            id: '3',
            title: 'Blessing Ceremonies',
            description: 'House blessings and special occasions',
            image: '/assets/images/blessing.jpg'
          }
        ]
      },
      'gallery': {
        id: 'gallery',
        title: 'Photo Gallery',
        description: 'Pictures from our events and activities.',
        type: 'gallery',
        images: [
          '/assets/images/gallery1.jpg',
          '/assets/images/gallery2.jpg',
          '/assets/images/gallery3.jpg',
          '/assets/images/gallery4.jpg',
          '/assets/images/gallery5.jpg',
          '/assets/images/gallery6.jpg'
        ]
      }
    };

    const content = staticData[menuId] || {
      id: menuId,
      title: 'Content Not Available',
      description: 'This content is coming soon.',
      type: 'page',
      content: '<p>This section is under development.</p>'
    };

    return of({
      success: true,
      data: content
    });
  }
}
