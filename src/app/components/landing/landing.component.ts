import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  title = 'Welcome to Vedic Web';

  // Left menu items (4 items)
  leftMenuItems = [
    {
      title: 'Home',
      submenu: []
    },
    {
      title: 'Events',
      submenu: []
    },
    {
      title: 'Activities',
      submenu: []
    },
    {
      title: 'Temple',
      submenu: [
        { title: 'Temple', link: '#' },
        { title: 'Priest', link: '#' }
      ]
    }
  ];

  // Right menu items (4 items)
  rightMenuItems = [
    {
      title: 'About Us',
      submenu: [
        { title: 'About Us', link: '#' },
        { title: 'Objectives', link: '#' },
        { title: 'Trustees', link: '#' },
        { title: 'Legal', link: '#' }
      ]
    },
    {
      title: 'Services',
      submenu: [
        { title: 'Services', link: '#' },
        { title: 'School Visits', link: '#' }
      ]
    },
    {
      title: 'Join Us',
      submenu: [
        { title: 'Members', link: '#' },
        { title: 'Volunteer', link: '#' }
      ]
    },
    {
      title: 'More',
      submenu: [
        { title: 'Gallery', link: '#' },
        { title: 'Contact', link: '#' },
        { title: 'Announcements', link: '#' }
      ]
    }
  ];
}
