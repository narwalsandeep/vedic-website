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
  getContentByEndpoint(endpoint: string, filterMenuItem?: string, menuId?: string): Observable<MenuApiResponse> {
    return this.http.get<any>(endpoint).pipe(
      map(apiResponse => this.transformApiResponse(apiResponse, endpoint, filterMenuItem, menuId)),
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
  private transformApiResponse(apiResponse: any, endpoint: string, filterMenuItem?: string, menuId?: string): MenuApiResponse {
    // Handle all Drupal API responses (starting with /api/)
    if (endpoint.startsWith('/api/') && Array.isArray(apiResponse)) {
      // Determine template type based on endpoint
      let template: 'default' | 'activities' | 'events' | 'contact' | 'about' | 'blog' = 'default';
      let title = 'Temple Information';
      let description = 'Content and information for our community';
      let filteredResponse = apiResponse;
      
      if (endpoint.includes('activity-manager')) {
        template = 'activities';
        title = 'Temple Activities';
        description = 'Discover our vibrant spiritual activities and community programs';
      } else if (endpoint.includes('events-management')) {
        title = 'Temple Events';
        description = 'Join us for upcoming festivals, ceremonies and special celebrations';
      } else if (endpoint.includes('article') && filterMenuItem) {
        // Filter articles based on field_menu_item parameter
        filteredResponse = apiResponse.filter((item: any) => {
          const menuItemValue = this.extractDrupalValue(item.field_menu_item);
          return menuItemValue && menuItemValue.toLowerCase() === filterMenuItem.toLowerCase();
        });
        
        // If only one article, return as page type with full content
        if (filteredResponse.length === 1) {
          const article = filteredResponse[0];
          const articleTitle = this.extractDrupalValue(article.title) || 'Temple Information';
          const articleBody = this.extractDrupalValue(article.body) || 'Content coming soon.';
          const imageField = this.extractDrupalValue(article.field_image);
          const articleImage = imageField ? `https://phpstack-1514009-5817011.cloudwaysapps.com${imageField}` : '';
          
          // Get proper title and description from our content info map
          const contentInfo = this.getArticleContentInfo(filterMenuItem);
          
          return {
            success: true,
            data: {
              id: menuId || endpoint.replace('/api/', '').replace('?_format=json', ''),
              title: contentInfo.title || articleTitle,
              description: contentInfo.description,
              type: 'page' as const,
              content: this.generateArticlePageContent(articleTitle, articleBody, articleImage)
            }
          };
        }
        
        // Multiple articles - return as list
        const contentInfo = this.getArticleContentInfo(filterMenuItem);
        title = contentInfo.title;
        description = contentInfo.description;
      } else if (endpoint.includes('booking-forms')) {
        title = 'Booking Forms';
        description = 'Download forms for poojas, ceremonies and temple services';
        template = 'default';
      } else if (endpoint.includes('trustee-management')) {
        title = 'Our Trustees';
        description = 'Meet the dedicated leaders guiding our temple community';
      } else if (endpoint.includes('prayers')) {
        title = 'Temple Prayers';
        description = 'Sacred prayers, mantras and devotional texts for your spiritual journey';
      } else if (endpoint.includes('services')) {
        title = 'Temple Services';
        description = 'Comprehensive range of spiritual services and ceremonies we offer';
      } else if (endpoint.includes('blog')) {
        title = 'Temple Blog';
        description = 'Stories, insights and updates from our vibrant temple community';
        template = 'blog';
      } else if (endpoint.includes('sad-announcements')) {
        title = 'Sad Announcements';
        description = 'Condolences and memorial notices for our departed community members';
      } else if (endpoint.includes('general-announcements')) {
        title = 'General Announcements';
        description = 'Important updates and news for our temple community';
      } else if (endpoint.includes('events-gallery')) {
        title = 'Photo Gallery';
        description = 'Cherished moments and memories from our temple events and celebrations';
        // Don't set template - use default which allows gallery ID matching
      }
      
      const items = filteredResponse.map((item: any) => {
            // Handle booking forms (PDFs) differently
            if (endpoint.includes('booking-forms')) {
              // Extract PDF URL from field_attachment
              let pdfUrl = '#';
              if (item.field_attachment && Array.isArray(item.field_attachment) && item.field_attachment.length > 0) {
                pdfUrl = item.field_attachment[0].url || '#';
              }
              
              // Extract description from field_notes
              const notes = this.extractDrupalValue(item.field_notes);
              const description = notes ? this.stripHtml(notes) : 'Download this form';
              
              return {
                id: this.extractDrupalValue(item.nid) || this.extractDrupalValue(item.title) || 'item',
                title: this.extractDrupalValue(item.title) || 'Booking Form',
                description: description,
                image: '',
                link: pdfUrl
              };
            }
            
            // Handle blog posts - show full content
            if (endpoint.includes('blog')) {
              const body = this.extractDrupalValue(item.body) || 'No content available.';
              
              return {
                id: this.extractDrupalValue(item.nid) || this.extractDrupalValue(item.title) || 'item',
                title: this.extractDrupalValue(item.title) || 'Blog Post',
                description: body, // Full HTML content
                image: '',
                link: ''
              };
            }
            
            // Handle general announcements
            if (endpoint.includes('general-announcements')) {
              const body = this.extractDrupalValue(item.body) || 'No content available.';
              
              return {
                id: this.extractDrupalValue(item.nid) || this.extractDrupalValue(item.title) || 'item',
                title: this.extractDrupalValue(item.title) || 'Announcement',
                description: body, // Full HTML content
                image: '', // No images for announcements
                link: ''
              };
            }
            
            // Handle sad announcements
            if (endpoint.includes('sad-announcements')) {
              const body = this.extractDrupalValue(item.body) || 'No content available.';
              
              // Extract attachment URL if available
              let attachmentUrl = '';
              if (item.field_attachment && Array.isArray(item.field_attachment) && item.field_attachment.length > 0) {
                attachmentUrl = item.field_attachment[0].url || '';
              }
              
              return {
                id: this.extractDrupalValue(item.nid) || this.extractDrupalValue(item.title) || 'item',
                title: this.extractDrupalValue(item.title) || 'Sad Announcement',
                description: body, // Full HTML content
                image: '', // No images for sad announcements
                link: attachmentUrl // PDF attachment if available
              };
            }
            
            // Handle events
            if (endpoint.includes('events-management')) {
              const body = this.extractDrupalValue(item.body) || '';
              const startDate = this.extractDrupalValue(item.field_start_date);
              const endDate = this.extractDrupalValue(item.field_end_date);
              const location = this.extractDrupalValue(item.field_location);
              
              // Extract event images from field_event_images array
              const eventImages: string[] = [];
              let mainEventImage = '';
              if (item.field_event_images && Array.isArray(item.field_event_images)) {
                item.field_event_images.forEach((img: any) => {
                  if (img.url) {
                    eventImages.push(img.url);
                  }
                });
                // Use first image as main image
                if (eventImages.length > 0) {
                  mainEventImage = eventImages[0];
                }
              }
              
              // Build event details HTML
              let eventContent = '<div class="event-details">';
              if (startDate) {
                const start = new Date(startDate);
                const startFormatted = `${start.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
                
                if (endDate) {
                  const end = new Date(endDate);
                  const endFormatted = end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                  eventContent += `<p><strong><i class="fas fa-calendar me-2"></i>Date:</strong> ${startFormatted} - ${endFormatted}</p>`;
                } else {
                  eventContent += `<p><strong><i class="fas fa-calendar me-2"></i>Date:</strong> ${startFormatted}</p>`;
                }
              }
              if (location) {
                eventContent += `<p><strong><i class="fas fa-location-dot me-2"></i>Location:</strong> ${location}</p>`;
              }
              eventContent += '</div>';
              
              // Add body content
              if (body) {
                eventContent += body;
              }
              
              // Add additional images if more than one
              if (eventImages.length > 1) {
                eventContent += '<div class="row g-4 mt-5">';
                eventImages.slice(1).forEach((imgUrl: string, imgIdx: number) => {
                  eventContent += `
                    <div class="col-6 col-md-6 col-lg-4">
                      <div class="additional-image-wrapper" style="position: relative; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12); cursor: pointer; height: 300px;">
                        <img src="${imgUrl}" class="img-fluid w-100 h-100" alt="Event image ${imgIdx + 2}" style="object-fit: cover; transition: transform 0.3s ease;">
                        <div class="image-overlay-small" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;">
                          <i class="fas fa-search-plus fa-2x text-white"></i>
                        </div>
                      </div>
                    </div>
                  `;
                });
                eventContent += '</div>';
              }
              
              return {
                id: this.extractDrupalValue(item.nid) || this.extractDrupalValue(item.title) || 'item',
                title: this.extractDrupalValue(item.title) || 'Event',
                description: eventContent,
                image: mainEventImage, // First image as main image
                link: ''
              };
            }
            
            // Handle trustees
            if (endpoint.includes('trustee-management')) {
              const designation = this.extractDrupalValue(item.field_designation) || 'Other';
              const category = this.extractDrupalValue(item.field_category) || '';
              const order = this.extractDrupalValue(item.field_order) || 999;
              
              // Extract trustee image from field_image
              let trusteeImage = '';
              if (item.field_image && Array.isArray(item.field_image) && item.field_image.length > 0) {
                trusteeImage = item.field_image[0].url || '';
              }
              
              // Build trustee content with designation
              let trusteeContent = '';
              if (designation) {
                trusteeContent = `<p class="text-primary fw-bold mb-2">${designation}</p>`;
              }
              
              return {
                id: this.extractDrupalValue(item.nid) || this.extractDrupalValue(item.title) || 'item',
                title: this.extractDrupalValue(item.title) || 'Trustee',
                description: trusteeContent,
                image: trusteeImage,
                category: designation,
                link: ''
              };
            }
            
            // Handle prayers
            if (endpoint.includes('prayers')) {
              const prayer = this.extractDrupalValue(item.field_prayer) || 'No prayer content available.';
              const language = this.extractDrupalValue(item.field_language) || '';
              
              // Build prayer content with language badge
              let prayerContent = '';
              if (language) {
                prayerContent += `<span class="badge bg-secondary mb-3">${language}</span>`;
              }
              prayerContent += prayer;
              
              return {
                id: this.extractDrupalValue(item.nid) || this.extractDrupalValue(item.title) || 'item',
                title: this.extractDrupalValue(item.title) || 'Prayer',
                description: prayerContent, // Full prayer content with language
                image: '',
                link: ''
              };
            }
            
            // Handle gallery events
            if (endpoint.includes('events-gallery')) {
              const eventTitle = item.title || 'Event Gallery';
              const eventBody = item.body || '';
              const eventName = item.field_select_an_event || '';
              const images = item.field_media_image || [];
              const galleryId = item.field_select_an_event || 'gallery-item';
              
              // Create simple description HTML (no modals)
              let galleryDescription = '';
              
              if (eventBody) {
                galleryDescription += eventBody;
              }
              
              if (eventName) {
                galleryDescription += `<p class="text-muted mt-3"><i class="fas fa-tag me-2"></i>${eventName}</p>`;
              }
              
              // Return item with images array - template will handle display
              return {
                id: galleryId,
                title: eventTitle,
                description: galleryDescription,
                images: images, // Pass images separately
                image: '',
                link: ''
              };
            }
            
            // Handle services
            if (endpoint.includes('services')) {
              const body = this.extractDrupalValue(item.body) || 'No content available.';
              
              // Extract service image from field_file
              let serviceImage = '';
              if (item.field_file && Array.isArray(item.field_file) && item.field_file.length > 0) {
                serviceImage = item.field_file[0].url || '';
              }
              
              return {
                id: this.extractDrupalValue(item.nid) || this.extractDrupalValue(item.title) || 'item',
                title: this.extractDrupalValue(item.title) || 'Service',
                description: body, // Full HTML content
                image: serviceImage,
                link: ''
              };
            }
            
            // Default handling for other content - show full content
            return {
            id: this.extractDrupalValue(item.nid) || this.extractDrupalValue(item.title) || 'item',
            title: this.extractDrupalValue(item.title) || 'Temple Content',
              description: this.extractDrupalValue(item.body) || 'No content available.', // Full HTML content
              image: this.extractDrupalValue(item.field_image) ? `https://phpstack-1514009-5817011.cloudwaysapps.com${this.extractDrupalValue(item.field_image)}` : '',
              link: ''
            };
          });
      
      // Reverse items for activities to show newest first
      const finalItems = endpoint.includes('activity-manager') ? items.reverse() : items;
      
      return {
        success: true,
        data: {
          id: menuId || endpoint.replace('/api/', '').replace('?_format=json', ''),
          title: title,
          description: description,
          type: 'list' as const,
          template: template,
          items: finalItems
        }
      };
    }
    // Handle single Drupal item (non-array response from /api/)
    else if (endpoint.startsWith('/api/') && !Array.isArray(apiResponse) && apiResponse.title) {
      return {
        success: true,
        data: {
          id: this.extractDrupalValue(apiResponse.nid) || 'page',
          title: this.extractDrupalValue(apiResponse.title) || 'Temple Information',
          description: this.stripHtml(this.extractDrupalValue(apiResponse.body) ? this.extractDrupalValue(apiResponse.body)!.substring(0, 150) : 'Learn more about our temple community'),
          type: 'page' as const,
          content: this.generateDrupalPageContent(apiResponse)
        }
      };
    }
    // Handle different API response formats based on endpoint
    else if (endpoint.includes('posts/') && !Array.isArray(apiResponse)) {
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
    const englishContent = post.body || 'This is a sample content for our temple website. We provide spiritual guidance, community services, and cultural events for all members.';
    return `<div class="fs-6 lh-lg">${englishContent}</div>`;
  }

  private stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  private extractDrupalValue(field: any): string | null {
    // Handle null or undefined
    if (!field) {
      return null;
    }
    
    // Handle direct string values
    if (typeof field === 'string') {
      return field;
    }
    
    // Handle Drupal array structure
    if (!Array.isArray(field) || field.length === 0) {
      return null;
    }
    
    // Handle different Drupal field structures
    // Prefer 'processed' over 'value' for formatted HTML fields
    if (field[0].processed !== undefined) {
      return field[0].processed;
    }
    
    if (field[0].value !== undefined) {
      return field[0].value;
    }
    
    return null;
  }

  private generateDrupalPageContent(item: any): string {
    const body = this.extractDrupalValue(item.body) || 'Content coming soon.';
    const imageField = this.extractDrupalValue(item.field_image);
    const image = imageField ? `https://phpstack-1514009-5817011.cloudwaysapps.com${imageField}` : '';
    
    return `
      ${image ? `<img src="${image}" class="img-fluid mb-4 rounded" alt="Temple" style="max-height: 400px; object-fit: cover; width: 100%;">` : ''}
      <div class="fs-6 lh-lg">${body}</div>
    `;
  }

  private generateArticlePageContent(title: string, body: string, image: string): string {
    return `
      ${image ? `<img src="${image}" class="img-fluid mb-4 rounded" alt="${title}" style="max-height: 400px; object-fit: cover; width: 100%;">` : ''}
      <div class="fs-6 lh-lg">${body}</div>
    `;
  }

  private getArticleContentInfo(filterMenuItem: string): { title: string; description: string } {
    const contentMap: { [key: string]: { title: string; description: string } } = {
      'the shrines': {
        title: 'The Shrines',
        description: 'Discover the sacred deities and divine shrines in our temple'
      },
      'priest': {
        title: 'Our Temple Priest',
        description: 'Meet our revered spiritual guide and temple priest'
      },
      'objective': {
        title: 'Our Objectives',
        description: 'Understanding our mission, vision and spiritual goals'
      },
      'legal': {
        title: 'Legal Information',
        description: 'Important legal information, policies and disclaimers'
      },
      'booking forms': {
        title: 'Booking Forms',
        description: 'Download forms for temple services and ceremonies'
      },
      'become a member': {
        title: 'Become a Member',
        description: 'Join our spiritual family and be part of our temple community'
      },
      'vedic volunteer': {
        title: 'Volunteer With Us',
        description: 'Contribute your time and skills in service to the divine'
      },
      'school visits': {
        title: 'School Visits',
        description: 'Educational and cultural programs for schools and students'
      },
      'donate': {
        title: 'Support Our Temple',
        description: 'Help us continue our spiritual mission through your generous contributions'
      },
      'contact': {
        title: 'Contact Us',
        description: 'Reach out to us for any questions, guidance or assistance'
      }
    };

    const key = filterMenuItem.toLowerCase();
    return contentMap[key] || {
      title: 'Temple Information',
      description: 'Content and information for our community'
    };
  }

  private generateUserContent(user: any): string {
    const userName = user.name || 'Temple Member';
    const userEmail = user.email || 'contact@temple.org';
    const userPhone = user.phone || '(555) 123-4567';
    
    return `
      <div class="fs-6 lh-lg">
        <h4 class="text-primary mb-3">${userName}</h4>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Phone:</strong> ${userPhone}</p>
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
