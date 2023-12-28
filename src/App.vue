<template>
  <v-app>
    <v-app-bar>Rodden Potatoes
      <v-card>
              <input v-model.trim="search" type="text" placeholder="Search Movies...">
              <v-btn @click="fetchMovies">Search</v-btn>
      </v-card>
    </v-app-bar>
    <v-navigation-drawer>
        <v-btn @click="getMovieList">Various Movies</v-btn>

    </v-navigation-drawer>
    <v-main>
        <v-container>
            <v-card v-if="searchResult.Title">
                <img :src="searchResult.Poster">
                <p>{{ searchResult.Title }}</p>
                <p>Director | {{ searchResult.Director }}</p>
                <p>Released | {{ searchResult.Released }}</p>
                <p>{{ searchResult.Genre }} | {{ searchResult.Runtime }}</p>
                <p>Cast | {{ searchResult.Actors }}</p>
                <p v-for="(rating, idx) in searchResult.Ratings" :key="idx">
                  {{ rating.Source }} | {{ rating.Value }} <br>
                </p>
            </v-card>
            <v-card v-if="allMovieLists" >
              <p v-for="movieInfo in allMovieLists" :key="Poster">
                  <img :src="movieInfo.Poster">
                  <p>{{ movieInfo.Title }}</p>
              </p>
            </v-card>
        </v-container>
    </v-main>
    <v-footer></v-footer>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

// state
const searchResult = ref({});
const unfoldVariousMovies = ref(false);
const search = ref('');
const getMovieIds = ref([]);
const imdbList = ref([]);
const allUrlList = ref([]);
const allMovieLists = ref([]);
// functions

/** Movie Search API */
const fetchMovies = async() => {

  axios.get(`https://www.omdbapi.com/?t=${search.value}&apikey=40e1b916`)
    .then(response => {
      // console.log('Response = ' + JSON.stringify(response.data));
      searchResult.value = response.data;
    })
}

/** get MovieList API*/
const getMovieList = async() => {
  unfoldVariousMovies.value = !unfoldVariousMovies.value;
  console.log(unfoldVariousMovies.value);
  if(unfoldVariousMovies.value) {
      //URL, Header
      const apiUrl = 'https://api.themoviedb.org/3/movie/changes'
      const headers = {
        'accept':'application/json',
        'Authorization' :'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZDQ5MzNkZTY4MWFkZmYyMmJiZWY0Y2JmNGMxYWQ3MiIsInN1YiI6IjY1ODUyYjYyNGYzM2FkNWJiNTAxZjk1OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WamkU9-Gxo0nLJYrzeXE1ntZ2aiz6cQ3fJuD2HCX5FE'
      }

      axios.get(apiUrl, { headers })
      .then(response => {
      for(let i of response.data.results) {
          getMovieIds.value.push(i.id);
      }
      }).then(convertMovieId);
  } else {
    getMovieIds.value = [];
    imdbList.value = [];
    allUrlList.value = [];
    allMovieLists.value = [];
  }
}
  /* convert theMovidb id to imdb_id API */
  const convertMovieId = async() => {

    // console.log('converMovieId = ' + JSON.stringify(getMovieIds.value));
    const apiUrls = [];

    // collect Urls
    for(let i of getMovieIds.value) {
      const apiUrl = `https://api.themoviedb.org/3/movie/${i}/external_ids`;
      apiUrls.push(apiUrl);
    }

    const promise = apiUrls.map(url => getListImdbId(url));
    try {
      const results = await Promise.all(promise).then(allMovieList).then(getAllMovieList)
      // .then(fetchData2(movieList));

    } catch (error){
      // console.log('variousMovies', error);
    }
}


/* Listing imdb_ID API */
const getListImdbId = async(url) => {

  try {
      const headers = {
        'accept':'application/json',
        'Authorization' :'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZDQ5MzNkZTY4MWFkZmYyMmJiZWY0Y2JmNGMxYWQ3MiIsInN1YiI6IjY1ODUyYjYyNGYzM2FkNWJiNTAxZjk1OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WamkU9-Gxo0nLJYrzeXE1ntZ2aiz6cQ3fJuD2HCX5FE'
      }
      const response = await axios.get(url , {headers});

      if((response.data.imdb_id != null)&&(response.data.imdb_id != '')) {

        imdbList.value.push(response.data.imdb_id);
        // console.log('imdbList.value = ' + JSON.stringify(imdbList.value));
      }
  } catch (error){

  }
}

/* collect All movieList info */
const allMovieList = async() => {
  // console.log('imdbList.value = ' + imdbList.value);

  for(let i of imdbList.value) {
    const apiUrl = `https://www.omdbapi.com/?i=${i}&apikey=40e1b916`;
    allUrlList.value.push(apiUrl);
  }
}

/* get All movieList API */
const getAllMovieList = async() => {
  // console.log('allUrlList = ' + JSON.stringify(allUrlList.value))
  const promises = allUrlList.value.map(url => fechData(url))
  try {
      const results = await Promise.all(promises);

  } catch (error){}
}

const fechData = async(url) => {

  try {
    const response = await axios.get(url);
    if(response.data.Poster != 'N/A') {
      allMovieLists.value.push(response.data);
    }
    // console.log('AllMovieLists = ' + JSON.stringify(allMovieLists.value))
  } catch (error) {}
}
</script>
