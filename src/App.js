import React, { useEffect, useState } from 'react';
import './App.css';
import { from, BehaviorSubject } from 'rxjs';
import { filter, mergeMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

const getPokempnByName = async (name) => {
	const allPokemons = await fetch('http://swapi.glitch.me/people').then((res) => res.json());
	console.log(allPokemons);
	return allPokemons.filter((pokemon) => pokemon.name.includes(name));
};

const searchSubject = new BehaviorSubject();
const searchResultsObservable = searchSubject.pipe(
	filter((val) => (val ? val.length > 0 : '')),
	debounceTime(750),
	distinctUntilChanged(),
	mergeMap((val) => from(getPokempnByName(val)))
);
const useObservable = (observable, setter) => {
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
	useObservable(searchResultsObservable, setResults);

	const handleSearchChange = (e) => {
		const newVal = e.target.value;
		setSearch(newVal);
		searchSubject.next(newVal);
	};
	return (
		<div className="App">
			<input type="text" value={search} onChange={handleSearchChange} />
			<div>
				{results.map((starwarCharacter) => (
					<div key={starwarCharacter.name}>{starwarCharacter.name}</div>
				))}
			</div>
		</div>
	);
}

export default App;
