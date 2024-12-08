import { useEffect, useState } from "react"
import { Delay, Delete, Edit, Uncheck } from "./icons"
import Swal from 'sweetalert2'

interface Book {
  id: number
  title: string
  author: string
  year: number
  isComplete: boolean
}

const STORAGE_KEY = "BOOKSHELF_APP";
const yearLimit = new Date().getFullYear();

function App() {
  const [books, setBooks] = useState<Book[]>(() => {
    if (typeof Storage !== "undefined") {
      try {
        const storedValue = localStorage.getItem(STORAGE_KEY);
        return storedValue ? JSON.parse(storedValue) : [];
      } catch (error) {
        console.error("Failed to parse localStorage data:", error);
        return [];
      }
    }
    return [];
  });

  // untuk edit dan delete
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // cari
  const [searchQuery, setSearchQuery] = useState("");

  // Cek Apakah browser mendukung localStorage
  useEffect(() => {
    if (typeof Storage === "undefined") {
      console.error("localStorage is not supported.");
    }
  }, []);

  // Simpan data ke localStorage saat books berubah
  useEffect(() => {
    console.log(books);
    if (typeof Storage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
      console.log("Data berhasil disimpan di localStorage.");
    } else {
      console.error("Storage is not available in this browser.");
    }
  }, [books]);

  // Fungsi untuk menambahkan buku baru
  const addBook = (id: number, title: string, author: string, year: number, isComplete: boolean) => {
    const newBook: Book = { id, title, author, year, isComplete };
    setBooks([...books, newBook]);
  };

  // fungsi untuk mengedit buku
  const editBook = (id: number, title: string, author: string, year: number) => {
    setBooks(books.map((book) => (book.id === id ? { ...book, title, author, year } : book)));
  };


  const handleEdit = async (book: Book) => {
    setSelectedBook(book);
    setIsEditModalOpen(true);
  };

  // Fungsi untuk menghapus buku
  const removeBook = (id: number) => {
    setBooks(books.filter((book) => book.id !== id));
  };

  // Fungsi konfirmasi hapus buku
  const handleDelete = async (book: Book) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin ingin menghapus buku ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      removeBook(book.id);
    }
  };

  // Fungsi untuk mengubah status buku
  const toggleBookStatus = (id: number) => {
    setBooks(books.map((book) => (book.id === id ? { ...book, isComplete: !book.isComplete } : book)));
  };

  // validasi data input tambah dan edit
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const title = form.elements.namedItem("title") as HTMLInputElement;
    const author = form.elements.namedItem("author") as HTMLInputElement;
    const year = form.elements.namedItem("year") as HTMLInputElement;
    const isComplete = form.elements.namedItem("isComplete") as HTMLInputElement;

    if (title.value && author.value && year.value) {
      const id = Date.now();
      addBook(id, title.value, author.value, Number(year.value), isComplete.checked);
      form.reset();
    }
  };

  const handleEditFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const title = form.elements.namedItem("title") as HTMLInputElement;
    const author = form.elements.namedItem("author") as HTMLInputElement;
    const year = form.elements.namedItem("year") as HTMLInputElement;

    if (selectedBook) {
      editBook(selectedBook.id, title.value, author.value, Number(year.value));
      setIsEditModalOpen(false);
      setSelectedBook(null);
    }
  };


  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === "year") {
      if (Number(value) > yearLimit) {
        setSelectedBook((prevBook) => {
          if (prevBook === null) {
            return null;
          } else {
            return { ...prevBook, [name]: yearLimit };
          }
        });
        return;
      }
    }

    setSelectedBook((prevBook) => {
      if (prevBook === null) {
        return null;
      } else {
        return { ...prevBook, [name]: value };
      }
    });
  };

  // cari
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">Bookshelf App</h1>
      </header>

      <main className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 md:gap-4">
        {/* kolom pertama */}
        {/* Section Tambah Buku Baru */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-4 max-h-min col-span-1">
          <h2 className="text-xl font-semibold mb-4">Tambah Buku Baru</h2>
          <form id="bookForm" className="space-y-4" onSubmit={handleFormSubmit}>
            <div>
              <label htmlFor="bookFormTitle" className="block text-sm font-medium mb-1">Judul</label>
              <input
                id="bookFormTitle"
                name="title"
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label htmlFor="bookFormAuthor" className="block text-sm font-medium mb-1">Penulis</label>
              <input
                id="bookFormAuthor"
                name="author"
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label htmlFor="bookFormYear" className="block text-sm font-medium mb-1">Tahun</label>
              <input
                id="bookFormYear"
                name="year"
                type="number"
                required
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  const maxYear = new Date().getFullYear();
                  if (Number(input.value) > maxYear) {
                    input.value = maxYear.toString();
                  }
                }}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div id="bookFormIsCompleteContainer" className="flex items-center gap-2">
              <input id="bookFormIsComplete" name="isComplete" type="checkbox" />
              <label htmlFor="bookFormIsComplete" className="text-sm">Selesai dibaca</label>
            </div>
            <button
              id="bookFormSubmit"
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Masukkan Buku ke rak <span>Belum selesai dibaca</span>
            </button>
          </form>
        </section>

        {/* kolom kedua */}
        <div className="col-span-2">
          {/* Section Cari Buku */}
          <section className="bg-white p-6 rounded-lg shadow-md mb-4">
            <h2 className="text-xl font-semibold mb-4">Cari Buku</h2>
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg p-2 w-full"
              placeholder="masukkan judul, penulis, atau tahun buku..."
              onChange={handleSearch}
            />
          </section>
          <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-4">
            {/* Section Belum Selesai Dibaca */}
            <section className="bg-white p-6 rounded-lg shadow-md mb-4">
              <h2 className="text-xl font-semibold mb-4">Belum selesai dibaca</h2>
              {books.map((book) => {
                if (book.isComplete) return "";
                if (searchQuery && !`${book.title.toLowerCase() + book.author.toLowerCase() + book.year.toString()}`.includes(searchQuery)) return "";
                return (
                  <div key={book.id} className="border border-gray-300 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-lg">{book.title}</h3>
                    <p>Penulis: {book.author}</p>
                    <p>Tahun: {book.year}</p>
                    <div className="flex gap-2 mt-4">
                      <div className="relative group">
                        <button
                          onClick={() => toggleBookStatus(book.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                          <Uncheck />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          Selesai Dibaca
                        </div>
                      </div>
                      <button onClick={() => { handleEdit(book) }} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">
                        <Edit />
                      </button>
                      <button onClick={() => handleDelete(book)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                        <Delete />
                      </button>
                    </div>
                  </div>
                )
              }
              )}
            </section>

            {/* Section Selesai Dibaca */}
            <section className="bg-white p-6 rounded-lg shadow-md mb-4">
              <h2 className="text-xl font-semibold mb-4">Selesai dibaca</h2>
              {books.map((book) => (
                book.isComplete &&
                <div key={book.id} className="border border-gray-300 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-lg">{book.title}</h3>
                  <p>Penulis: {book.author}</p>
                  <p>Tahun: {book.year}</p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => toggleBookStatus(book.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                      <Delay />
                    </button>
                    <button onClick={() => handleEdit(book)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">
                      <Edit />
                    </button>
                    <button onClick={() => handleDelete(book)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                      <Delete />
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>
      </main>

      {/* edit modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 top-0 right-0 left-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-11/12 max-w-md rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Data Buku</h2>
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Judul
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={selectedBook?.title}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label htmlFor="author" className="block text-sm font-medium mb-1">
                  Penulis
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={selectedBook?.author}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium mb-1">
                  Tahun
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={selectedBook?.year}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
