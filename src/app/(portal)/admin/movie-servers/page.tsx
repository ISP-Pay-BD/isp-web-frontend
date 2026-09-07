import { MovieServersPage } from '@/features/admin/movie-servers';

export const metadata = { title: 'Movie Servers', description: 'BDIX and FTP movie endpoints' };

export default function AdminMovieServersRoute() {
  return <MovieServersPage />;
}
