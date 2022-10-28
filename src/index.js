import './css/styles.css';
import axios from 'axios';
import { PixabayAPI } from './PixabayAPI';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { createMarkup } from './createMarkup';


const refs = {
    form: document.querySelector('.search-form'),
    list: document.querySelector('.js-gallery'),
    loadMoreBtn: document.querySelector('.js-more'),
}

refs.form.addEventListener('submit', handleSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

const pixabay = new PixabayAPI();

async function handleSubmit (event) {
    event.preventDefault();


const {
    elements: {query},
  } = event.currentTarget;
  const searchQuery = query.value.trim().toLowerCase();
  if (!searchQuery) {
    return;
  }
  pixabay.query = searchQuery;

  clearPage();
    try {
        const { hits, total } = await pixabay.getPhotos();
        if (hits.length === 0) {
            Notify.info(`За вашим запитом
         ${searchQuery} зображень не знайдено!
        `);
            return;

        }
        const markup = createMarkup(hits);
        refs.list.insertAdjacentHTML('beforeend', markup);

        pixabay.calculateTotalPages(total);

        Notify.success(`Ми знайшли ${total} зображень по запиту ${searchQuery}`);

        if (pixabay.isShowLoadMore) {
            refs.loadMoreBtnRef.classList.remove('visually-hidden');

            //   io.observe(target);
        }
    } catch (error) {
        Notify.failure(error.message, 'Щось пішло не так!');
        clearPage();
    }
};

function onLoadMore () {
    pixabay.incrementPage();

    if (!pixabay.isShowLoadMore) {
        refs.loadMoreBtn.classList.add('is-hidden');
    };

  pixabay
    .getPhotos()
    .then(({ hits }) => {
      const markup = createMarkup(hits);
      refs.list.insertAdjacentHTML('beforeend', markup);
    })
    .catch(error => {
      Notify.failure(error.message, 'Щось пішло не так!');
      clearPage();
    });
};
 

function clearPage() {
  pixabay.resetPage();
  refs.list.innerHTML = '';
  refs.loadMoreBtn.classList.add('is-hidden');
}