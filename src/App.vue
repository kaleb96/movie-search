<template>
  <v-app>
    <v-app-bar>Rodden Potatoes</v-app-bar>
    <v-navigation-drawer>
        <v-btn @click="fetchMakeMoviesList">Varius Movies</v-btn>

    </v-navigation-drawer>
    <v-main>
        <v-container>
            <v-card>
              <input v-model.trim="search" type="text" placeholder="Search Movies...">
              <v-btn @click="fetchMovies">Search</v-btn>
            </v-card>
            <v-card v-if="movies.Title">
                <img :src="movies.Poster">
                <p>{{ movies.Title }}</p>
                <p>Director | {{ movies.Director }}</p>
                <p>Released | {{ movies.Released }}</p>
                <p>{{ movies.Genre }} | {{ movies.Runtime }}</p>
                <p>Cast | {{ movies.Actors }}</p>
                <p v-for="(rating, idx) in movies.Ratings" :key="idx">
                  {{ rating.Source }} | {{ rating.Value }} <br>
                </p>
            </v-card>
            <v-card>{{ variusMoviesList }}</v-card>
        </v-container>
    </v-main>
    <v-footer></v-footer>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

// state
const movies = ref({});
const search = ref('');
const movieList = ref([]);
const variusMoviesList = ref([]);
// functions
const fetchMovies = async() => {

  axios.get(`https://www.omdbapi.com/?t=${search.value}&apikey=40e1b916`)
    .then(response => {
      // console.log('Response = ' + JSON.stringify(response));
      movies.value = response.data;
    })

}

const fetchMakeMoviesList = async() => {

  const apiUrl = 'https://api.themoviedb.org/3/movie/changes'
  const headers = {
    'accept':'application/json',
    'Authorization' :'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZDQ5MzNkZTY4MWFkZmYyMmJiZWY0Y2JmNGMxYWQ3MiIsInN1YiI6IjY1ODUyYjYyNGYzM2FkNWJiNTAxZjk1OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WamkU9-Gxo0nLJYrzeXE1ntZ2aiz6cQ3fJuD2HCX5FE'
  }
  axios.get(apiUrl, { headers })
  .then(response => {
    // console.log('tmpList.value = ' + JSON.stringify(response.data.results));
    for(let i of response.data.results) {
        movieList.value.push(i.id);
    }
    // console.log('tmpList = ' + tmpList);
  }).then(variusMovies);
}

const variusMovies = async() => {

  // console.log('tmpList = ' + JSON.stringify(movieList));
  for(let i of movieList.value) {
    const apiUrl = `https://api.themoviedb.org/3/movie/${i}/external_ids`
    const headers = {
      'accept':'application/json',
      'Authorization' :'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZDQ5MzNkZTY4MWFkZmYyMmJiZWY0Y2JmNGMxYWQ3MiIsInN1YiI6IjY1ODUyYjYyNGYzM2FkNWJiNTAxZjk1OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.WamkU9-Gxo0nLJYrzeXE1ntZ2aiz6cQ3fJuD2HCX5FE'
    }
    axios.get(apiUrl, { headers })
    .then(response => {
      // console.log(response.data);
      if(response.data.imdb_id) {
        // console.log('data = ' +response.data.imdb_id)
        variusMoviesList.value.push(response.data.imdb_id)
      }
    }).catch(error => {
      console.log('noData' , error);
    })
  }

}

</script>
