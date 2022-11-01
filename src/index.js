import './css/styles.css';
import axios from 'axios';
import { PixabayAPI } from './PixabayAPI';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { createMarkup } from './createMarkup';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";


const refs = {
    form: document.querySelector('.search-form'),
    list: document.querySelector('.js-gallery'),
    loadMoreBtn: document.querySelector('.js-more'),
}

refs.form.addEventListener('submit', handleSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);



const options = {
  root: null,
  rootMargin: '100px',
  threshold: 1.0,
};

const callback = async function (entries, observer) {
  entries.forEach(async entry => {
    // if (entry.isIntersecting && entry.intersectionRect.bottom > 550) {
    if (entry.isIntersecting) {
      pixabay.incrementPage();
      observer.unobserve(entry.target);

      try {
        const { hits } = await pixabay.getPhotos();

        const markup = createMarkup(hits);

        refs.list.insertAdjacentHTML('beforeend', markup);
        if (pixabay.isShowLoadMore) {
          const target = document.querySelector('.photo-card:last-child');
          io.observe(target);
          lightbox.refresh();
        }
      } catch (error) {
        Notify.failure(error.message, 'Щось пішло не так!');
        clearPage();
      }
    }
  });
};

const pixabay = new PixabayAPI();

const lightbox = new SimpleLightbox('.gallery a', { 
        captionData: 'alt',
        captionDelay: '250',
  });

const io = new IntersectionObserver(callback, options);

async function handleSubmit (event) {
    event.preventDefault();
const {
    elements: {searchQuery},
  } = event.currentTarget;
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return;
  }
  pixabay.searchQuery = query;

  clearPage();
    try {
        const { hits, total } = await pixabay.getPhotos();
        if (hits.length === 0) {
            Notify.failure(`Sorry, there are no images matching your search query. Please try again.`
      );
            return;

        }
        const markup = createMarkup(hits);
        refs.list.insertAdjacentHTML('beforeend', markup);

        pixabay.calculateTotalPages(total);

        Notify.success(`Hooray! We found ${total} images.`);

      if (pixabay.isShowLoadMore) {
          // refs.loadMoreBtn.classList.remove('is-hidden');
            const target = document.querySelector('.photo-card:last-child');
             console.log(target);
             io.observe(target);
             lightbox.refresh();
        }
    } catch (error) {
        console.log(error);
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
      console.log(error);
      clearPage();
    });

};
 

function clearPage() {
  pixabay.resetPage();
  refs.list.innerHTML = '';
  refs.loadMoreBtn.classList.add('is-hidden');
}