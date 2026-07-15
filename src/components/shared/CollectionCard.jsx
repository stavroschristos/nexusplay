import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Layers } from 'lucide-react';

export default function CollectionCard({ collection }) {
  return (
    <Link to={`/collections/${collection.id}`} className="block rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden group hover:ring-2 hover:ring-primary/40 transition-all">
      <div className="relative h-32 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary">
        {collection.cover_url && (
          <img src={collection.cover_url} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="font-semibold text-white text-sm line-clamp-1">{collection.title}</h3>
        </div>
      </div>
      <div className="p-3">
        {collection.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{collection.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {collection.games?.length || 0} games
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {collection.likes_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {collection.comments_count || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}