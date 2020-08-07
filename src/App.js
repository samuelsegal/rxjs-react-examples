import React, { useEffect, useState } from 'react';
import './App.css';
import { from, BehaviorSubject, merge, add, combineLatest, Subject, forkJoin, zip } from 'rxjs';
import {
	filter,
	mergeMap,
	debounceTime,
	distinctUntilChanged,
	concatMap,
	tap,
	pluck,
	map,
	combineAll,
	withLatestFrom,
} from 'rxjs/operators';
import { mergeAll } from 'rxjs-compat/operator/mergeAll';
import { share } from 'rxjs-compat/operator/share';

const getStarWarCharactersByName = async (name) => {
	const starwarCharacters = await fetch('http://swapi.glitch.me/people').then((res) => res.json());
	console.log(`NAME: ${name}`, name);
	return starwarCharacters.filter((stawarCharacter) =>
		stawarCharacter.name.toLowerCase().includes(typeof name === 'string' ? name.toLowerCase() : '')
	);
};
const getPokemonByName = async (name) => {
	const { results: pokemons } = await fetch('https://pokeapi.co/api/v2/pokemon/?limit=1000').then((res) =>
		res.json()
	);

	return pokemons.filter((pokemon) => pokemon.name.includes(name));
};
const searchSubject = new Subject();
const searchResultsStawarObservable = searchSubject.pipe(
	filter((val) => (val ? val.length > 0 : '')),
	debounceTime(750),
	distinctUntilChanged(),
	mergeMap((val) => from(getStarWarCharactersByName(val)))
);
const searchResultsPokemonObservable = searchSubject.pipe(
	filter((val) => (val ? val.length > 0 : '')),
	debounceTime(750),
	distinctUntilChanged(),
	mergeMap((val) => from(getPokemonByName(val)))
);
const searchResultsObservable$ = zip(searchResultsStawarObservable, searchResultsPokemonObservable).pipe(
	map((res) => [].concat(...res)),
	map((res) => res.sort())
);

console.log(searchResultsObservable$);
const useObservable = (observable, setter) => {
	console.log(observable);
	useEffect(() => {
		const subscription = observable.subscribe((res) => {
			setter(res);
		});
		//return clean up code
		return () => subscription.unsubscribe();
	}, [observable, setter]);
};
function App() {
	const [search, setSearch] = useState('');
	const [results, setResults] = useState([]);
	useObservable(searchResultsObservable$, setResults);

	const handleSearchChange = (e) => {
		const newVal = e.target.value;
		setSearch(newVal);
		searchSubject.next(newVal);
	};
	return (
		<div className="App">
			<input type="text" value={search} onChange={handleSearchChange} />
			<div>
				{results.map((starwarOrPokemonFOund) => (
					<div key={starwarOrPokemonFOund.name}>{starwarOrPokemonFOund.name}</div>
				))}
			</div>
		</div>
	);
}

export default App;
