import React, { useEffect, useState } from 'react'
import Search from './components/search'
import Spinner from './components/spinner'
import MovieCard from './components/movieCard';
import { useDebounce  } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';

const API_BASE_URL= 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [trending,setTrending] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [isLoading,setIsLoading] = useState(false);
    const [deBouncedSearchTerm, setDeBouncedSearchTerm] = useState('')

    useDebounce(() => setDeBouncedSearchTerm(searchTerm),500,[searchTerm]);

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('');
        try{
            const endpoint= query 
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            const response= await fetch(endpoint,API_OPTIONS)
            // alert(response)

            if(!response.ok){ throw new Error('Failed to fetch movies');}

            const data = await response.json();
            
            if(data.response=='False') {
                setErrorMessage(data.error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);

            if(query && data.results.length >0 ){
                await updateSearchCount(query, data.results[0])
            }

        } catch (error){
            console.error(`Error fetching movies: ${error}`)
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies = async() => {
        try{
            const movies = await getTrendingMovies();
            setTrending(movies);

        } catch(error){
            console.log(`Error featching tending movies: ${error}`);
        }
    }

    useEffect(() => {fetchMovies(deBouncedSearchTerm);},[deBouncedSearchTerm]);
    useEffect(() => {loadTrendingMovies();},[]);

    return (
        <main>
            <div className='pattern' />
            <div className='wrapper'>
                <header>
                    <img src='./logo-1.png' alt='logo' className='mb-10'/>
                    {/* <img src='./hero.png' alt='Hero Banner'/> */}
                    <h1 className='mt-10'>Find the Right <span className="text-gradient">Movie</span> Without the Endless Searching</h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trending.length > 0 && (
                    <section className='trending'>
                        <h2>Trending</h2>

                        <ul>
                            {trending.map((movie,index) => (
                                <li key={movie.$id}>
                                    <p>{index+1}</p>
                                    <img src={movie.poster_url} alt={movie.title}/>
                                </li>
                            ))}
                        </ul>

                    </section>
                )}

                <section className='all-movies'>
                    <h2>Popular</h2>

                    {isLoading ? (
                    <Spinner />
                    ) : errorMessage ? (
                        <p className='text-red-500'>{errorMessage}</p>
                    ) : (
                        <ul>
                        {movieList.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                     </ul>
                    )}
                </section>
            </div>
        </main>
    )
}

export default App
