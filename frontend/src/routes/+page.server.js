export async function load({ fetch }) {
	const res = await fetch('http://localhost:5000/files', {
		method: 'GET'
	});

	const data = await res.json();
	return data;
}
