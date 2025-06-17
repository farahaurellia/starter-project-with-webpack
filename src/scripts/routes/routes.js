import HomePage from '../pages/home/home-page';
import LoginView from '../pages/loginView';
import RegisterView from '../pages/registerView';
import AddStoryView from '../pages/add-story';
import DetailStoryView from '../pages/detail-story';
import Presenter from '../presenters/presenter';
import Model from '../../models/model';

const routes = {
  '/': new HomePage(),
  '/login': new LoginView(),
  '/register': new RegisterView(),
  '/add-story': new AddStoryView(),
};

const initializePage = async (route) => {
  const mainContent = document.getElementById('main-content');

  if (route === '/login') {
    const model = new Model();
    const loginView = new LoginView();
    const presenter = new Presenter(loginView, model);
    console.log('Presenter sudah diinisialisasi (routes)');
    loginView.setPresenter(presenter);
    console.log('LoginView render dipanggil (routes)');
    console.log('LoginView appContainer:', loginView.appContainer);
    loginView.render();
    console.log('LoginView render selesai (routes)');
    console.log('Sebelum clear:', mainContent.childNodes);
    mainContent.innerHTML = '';
    mainContent.appendChild(loginView.appContainer);
    await loginView.afterRender?.();
  } else if (route === '/register') {
    const registerView = new RegisterView();
    registerView.render();
    const model = new Model();
    new Presenter(registerView, model);
    mainContent.innerHTML = '';
    mainContent.appendChild(registerView.appContainer);
    await registerView.afterRender?.();
  } else if (route === '/add-story') {
    const addStoryView = new AddStoryView();
    addStoryView.render();
    const model = new Model();
    new Presenter(addStoryView, model);
    mainContent.innerHTML = '';
    mainContent.appendChild(addStoryView.appContainer);
    await addStoryView.afterRender?.();
  } else if (route.startsWith('/stories')) {
    const id = route.split('/')[2];
    const detailStoryView = new DetailStoryView();
    const model = new Model();
    console.log('Before clear:', mainContent.childNodes);
    mainContent.innerHTML = '';
    console.log('After clear:', mainContent.childNodes);
    const token = localStorage.getItem('token');
    const detailEl = await detailStoryView.render({ id, model, token });
    mainContent.appendChild(detailEl);
    console.log('After append:', mainContent.childNodes);
  } else if (route === '/') {
    routes['/'].render();
    mainContent.innerHTML = '';
    mainContent.appendChild(routes['/'].appContainer);
    await routes['/'].afterRender?.();
  }
};

const handleRoute = () => {
  console.log('handleRoute called', window.location.hash);
  const hash = window.location.hash.slice(1) || '/';
  initializePage(hash);
};

window.removeEventListener('hashchange', handleRoute);
if (!window._hasRouteListener) {
  window.addEventListener('hashchange', handleRoute);
  window._hasRouteListener = true;
}
handleRoute();

export default routes;
