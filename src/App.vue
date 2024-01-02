<template>
  <v-app>
    <v-app-bar>
        <v-container>
          <v-card>
            <div>Rodden Potatoes</div>
          </v-card>
        </v-container>

      <v-card class="search">
              <input v-model.trim="search" type="text" placeholder="Search Movies...">
              <v-btn @click="fetchMovies">Search</v-btn>
      </v-card>
    </v-app-bar>

    <v-navigation-drawer>
        <div class="movies" @click="getMovieList">Various Movies</div>
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
        </v-container>



        <v-container>
          <v-row align="center" justify="center">
            <v-col
              v-for="movieInfo in tmpLists"
              :key="movieInfo.Poster"
              cols="auto"
            >
              <v-card
                class="mx-auto"
                max-width="344"
                :variant="movieInfo"
              >
                <v-card-item>
                  <div>
                    <img :src="movieInfo.Poster">
                    <div class="text-h4">{{ movieInfo.Title }}</div>
                  </div>
                </v-card-item>
              </v-card>
            </v-col>
          </v-row>

          <!-- <v-card
            :title="movieInfo.Title"
            subtitle="Subtitle"
            variant="tonal"
            v-for="movieInfo in tmpLists" :key="movieInfo.Poster"
            >
            <img :src="movieInfo.Poster">
          </v-card> -->



        </v-container>
          <!-- <v-card class=text-center>

              <p v-for="movieInfo in tmpLists" :key="movieInfo.Poster" >
                  <img :src="movieInfo.Poster">
                  <p>{{ movieInfo.Title }}</p>
              </p>
            </v-card> -->

            <v-btn v-for="page in totalPage" :key="page" @click="checkPage(page)">{{ page }}</v-btn>
            <v-btn>totalItems : {{ totalItems }}</v-btn>

      </v-main>

      <v-footer></v-footer>

 </v-app>
</template>

<script setup>
import { ref, computed} from 'vue';
import axios from 'axios';

// state
const searchResult = ref({});
const unfoldVariousMovies = ref(false);
const search = ref('');
const getMovieIds = ref([]);
const imdbList = ref([]);
const allUrlList = ref([]);
const allMovieLists = ref([]);
const items = 10;
const currentPage = ref(1);
const totalItems = computed(() => {
  return allMovieLists.value.length;
});

const totalPage = computed(() => {
  return Math.ceil(allMovieLists.value.length/items);
});


const checkPage = (page) => {
  currentPage.value = page;
}


/* watch and update allMovieLists each pages */
const tmpLists = computed(() => {

  const start = (currentPage.value - 1) * items;
  const end = start + items;
  // console.log('tmpLists' + start + ' | ' + end);
  return allMovieLists.value.slice(start, end)
})


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

/* Listing All movies Data */
const fechData = async(url) => {

  try {
    const response = await axios.get(url);
    if(response.data.Poster != 'N/A' && response.data.Poster != '' && response.data.Poster != null) {
      allMovieLists.value.push(response.data);
    }
    // console.log('AllMovieLists = ' + JSON.stringify(allMovieLists.value.length))
  } catch (error) {}
}
</script>

<style scoped>
  .text-center {
    display: flex;
    flex-wrap: wrap;

  }


</style>
