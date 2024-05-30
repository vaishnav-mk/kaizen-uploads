<script>
	import toast, { Toaster } from 'svelte-french-toast';

	export let data = {};
	console.log(data);
	let searchString = '';
	let filteredFiles = [];

	$: {
		filteredFiles = data.files.filter(
			(file) =>
				file.name.toLowerCase().includes(searchString.toLowerCase()) ||
				file.id.toLowerCase().includes(searchString.toLowerCase())
		);
	}

	export async function handleUpload() {
		const input = document.getElementById('fileInput');
		const files = input.files;

		if (files.length === 0) {
			return;
		}

		const formData = new FormData();
		for (let i = 0; i < files.length; i++) {
			formData.append('files', files[i]);
		}

		const uploadPromise = fetch('http://localhost:5000/upload', {
			method: 'POST',
			body: formData
		});

		const toastPromise = toast.promise(uploadPromise, {
			position: 'top-right',
			style: 'border-radius: 200px; background: #333; color: #fff;',
			loading: 'Uploading files...',
			success: 'Files uploaded successfully',
			error: 'Failed to upload files'
		});

		try {
			const response = await uploadPromise;
			const data = await response.json();
			const fileId = data.files[0].id;
			if (response.ok) {
				toast.success('Link copied to clipboard', {
					position: 'top-right',
					style: 'border-radius: 200px; background: #333; color: #fff;'
				});
				navigator.clipboard.writeText(`https://drive.google.com/file/d/${fileId}/view?usp=sharing`);
				location.reload();
			} else {
				throw new Error('Failed to upload files');
			}
		} catch (error) {
			console.error('Error uploading files:', error);
		}
	}
</script>

<h1 class="w-full bg-dashboard flex justify-between font-bold font-display text-highlight">
	<div class="text-highlight font-display text-5xl p-7">KaizenKlass Uploads</div>
</h1>

<div class="p-10 bg-main min-h-screen">
	<div class="flex items-center text-xl md:w-full mb-7 gap-4">
		<input
			type="file"
			id="fileInput"
			multiple
			class="flex p-2 w-full text-sm h-10 file:border-0 file:bg-transparent file:text-sm file:font-medium rounded-md font-base font-bold bg-highlightSecondary text-mainLighter"
		/>
		<button
			on:click={handleUpload}
			class="rounded-md p-1 bg-highlightSecondary text-mainLighter font-semibold h-full"
			disabled={filteredFiles.length === 0}>Upload</button
		>
	</div>

	<div class="flex items-center space-x-3 text-xl md:w-full mb-10">
		<input
			type="text"
			bind:value={searchString}
			class="flex h-10 w-full border border-input text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 p-2 rounded-md font-base font-bold bg-highlightSecondary text-mainLighter"
			placeholder="Search uploads..."
		/>
	</div>

	<div
		class="flex flex-col md:flex md:justify-center md:items-center md:flex-row md:flex-wrap md:w-full gap-8"
	>
		{#each filteredFiles as file}
			<div
				class="hover:border-highlight p-5 flex justify-between items-center md:p-2 border border-mainLighter md:w-80 md:h-80 rounded-3xl md:flex md:flex-col md:justify-center md:items-center md:space-y-5 bg-mainLighter transition-all"
				href={`https://drive.google.com/file/d/${file.id}/view`}
				target="_blank"
			>
			
				<iframe
					src={`https://drive.google.com/file/d/${file.id}/preview`}
					allow="autoplay"
					title="Image preview"
					class="rounded-md"
					frameborder="0"
				></iframe>
				<div class="flex flex-col items-center max-w-full max-h-full truncate text-ellipsis">
					<button
						class="font-base px-4 font-semibold text-center text-xl bg-highlightSecondary rounded-t-md text-mainLighter w-full"
					>
						{new Date(file.createdTime).toLocaleString()}
					</button>
					<button
						class="font-base px-4 font-semibold text-center bg-highlightSecondary rounded-b-md text-mainLighter w-full overflow-hidden whitespace-normal truncate text-ellipsis border-t-2 border-mainLighter"
						on:click={() =>
							navigator.clipboard
								.writeText(`https://drive.google.com/file/d/${file.id}/view?usp=sharing`)
								.then(() => {
									toast.success('Copied link to clipboard', {
										position: 'top-right',
										style: 'border-radius: 200px; background: #333; color: #fff;'
									});
								})}
					>
						{file.name}
					</button>
				</div>
			</div>
		{/each}
	</div>

	{#if filteredFiles.length === 0}
		<div class="text-center text-lg font-semibold text-highlightSecondary mt-10">
			No files matched the search criteria
		</div>
	{/if}
</div>
<Toaster />
