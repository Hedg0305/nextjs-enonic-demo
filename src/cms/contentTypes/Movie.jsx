import React from "react"

import {APP_NAME, APP_NAME_UNDERSCORED, getContentLinkUrlFromXpPath} from '../../enonicAdapter/enonic-connection-config'


// fully qualified XP content-type name:
export const MOVIE_CONTENTTYPE_NAME = `${APP_NAME}:movie`;


export const movieQuery = `
query($path:ID!){
  guillotine {
    get(key:$path) {
      type
      displayName
      ... on ${APP_NAME_UNDERSCORED}_Movie {
        data {
          subtitle
          abstract
          trailer
          release
          photos {
            ... on media_Image {                                             
              imageUrl: imageUrl(type: absolute, scale: "width(1000)")       
              attachments {                                                 
                name
              }
            }
          }
          cast {
            character
            actor {
              ... on ${APP_NAME_UNDERSCORED}_Person {
                _path
                displayName
                data {
                  photos {
                    ... on media_Image {                                             
                      imageUrl: imageUrl(type: absolute, scale: "block(200,200)")       
                      attachments {                                                 
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
        parent {
            displayName
            _path
        }
      }
    }
  }
}`;


// Main movie info: release year, poster image and abstract text.
// data = movie.data (object from MovieView)
const MovieInfo = ({data}) => {
    const posterPhoto = (data.photos || [])[0] || {};

    return (
        <>
            { data.release && (
                <p>({ new Date(data.release).getFullYear() })</p>
            )}

            { posterPhoto.imageUrl && (
                <img src={posterPhoto.imageUrl}
                     title={data.subtitle || movie.displayName}
                     alt={data.subtitle || movie.displayName}
                     width="350"
                />
            )}

            <p>{data.abstract}</p>
        </>
    )
}


// List persons starring in the movie.
// cast = movie.data.cast (array from MovieView)
const Cast = ({cast}) => !!(cast?.length) && (
    <div>
        <h4>Cast</h4>
        <ul style={{listStyle: "none", display: "flex", flexFlow: "row wrap"}}>
            {cast.map(
                (person, i) => person && (
                    <CastMember key={i} {...person} />
                )
            )}
        </ul>
    </div>
);


// Person in the cast list:
// person = an item in the movie.data.cast array (from Cast)
const CastMember = (person) => {
    const { character, actor={} } = person;
    const { displayName, _path, data={} } = actor;
    const personPhoto = (data.photos || [])[0] || {};

    return (
        <li style={{marginRight: "15px"}}>
            {
                personPhoto.imageUrl &&
                <img src={personPhoto.imageUrl}
                     title={`${displayName} as ${character}`}
                     alt={`${displayName} as ${character}`}
                     width="100"
                />
            }
            <div>
                <p>{character}</p>
                <p><a href={getContentLinkUrlFromXpPath(_path)}>
                    {displayName}
                </a></p>
            </div>
        </li>
    );
}


// "Back to Movies" link at the bottom
// parent = movie.parent (object from MovieView)
const BackLink = ({parent}) => parent && (
    <p><a href={getContentLinkUrlFromXpPath(parent._path)}>
        Back to {parent.displayName}
    </a></p>
);




// Main entry component
const MovieView = ({content}) => {
    const {displayName, data = {}, parent = {}} = content;
    return (
        <>
            <div>
                <h2>{displayName}</h2>
                <MovieInfo data={data}/>
                <Cast cast={data.cast}/>
            </div>

            <BackLink parent={parent}/>
        </>
    );
};

export default MovieView;
