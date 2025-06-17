// CSS imports
import '../styles/styles.css';
import App from './pages/app';
import Model from '../models/model';
import Presenter from './presenters/presenter';

document.addEventListener('DOMContentLoaded', async () => {

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  // Hamburger menu logic (tetap)
  const drawerButton = document.getElementById('drawer-button');
  const navList = document.getElementById('nav-list');

  function handleResize() {
    if (window.innerWidth <= 800) {
      drawerButton.style.display = 'block';
      navList.classList.remove('open');
    } else {
      drawerButton.style.display = 'none';
      navList.classList.remove('open');
    }
  }
  handleResize();
  window.addEventListener('resize', handleResize);

  drawerButton.addEventListener('click', (e) => {
    e.stopPropagation(); // agar tidak langsung tertutup oleh event document
    navList.classList.toggle('open');
    console.log('Hamburger clicked, nav-list class:', navList.className);
  });

  document.addEventListener('click', (e) => {
    if (
      window.innerWidth <= 800 &&
      !navList.contains(e.target) &&
      !drawerButton.contains(e.target)
    ) {
      navList.classList.remove('open');
    }
  });
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});